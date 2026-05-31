import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = (__ENV.BASE_URL || "http://localhost:3001").replace(/\/$/, "");
const PUBLICATION_SLUG = __ENV.PUBLICATION_SLUG;

export const errorRate = new Rate("tdw_errors");
export const readyLatency = new Trend("tdw_ready_latency");
export const publicReadLatency = new Trend("tdw_public_read_latency");

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 25 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
    tdw_errors: ["rate<0.01"],
    tdw_ready_latency: ["p(95)<800"],
    tdw_public_read_latency: ["p(95)<1000"],
  },
};

const requests = [
  {
    name: "health_ready",
    url: `${BASE_URL}/health/ready`,
    trend: readyLatency,
  },
  {
    name: "jobs",
    url: `${BASE_URL}/jobs`,
    trend: publicReadLatency,
  },
  {
    name: "publications",
    url: `${BASE_URL}/publications?page=1&limit=10`,
    trend: publicReadLatency,
  },
  {
    name: "patch_notes",
    url: `${BASE_URL}/publications?page=1&limit=10&type=PATCH_NOTE`,
    trend: publicReadLatency,
  },
  ...(PUBLICATION_SLUG ? [{
    name: "publication_by_slug",
    url: `${BASE_URL}/publications/slug/${PUBLICATION_SLUG}`,
    trend: publicReadLatency,
  }] : []),
];

export default function () {
  const request = requests[Math.floor(Math.random() * requests.length)];
  const response = http.get(request.url, {
    tags: { endpoint: request.name },
    headers: {
      "X-Request-Id": `k6-${request.name}-${__VU}-${__ITER}`,
    },
  });

  request.trend.add(response.timings.duration);

  const ok = check(response, {
    [`${request.name} returned 2xx`]: (res) =>
      res.status >= 200 && res.status < 300,
    [`${request.name} has request id`]: (res) =>
      Boolean(res.headers["X-Request-Id"]),
  });

  errorRate.add(!ok);
  sleep(1);
}
