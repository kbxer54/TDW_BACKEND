import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

/*
Standalone script to test Resend integration without running the full server.
Run via terminal: npx ts-node src/tests/testResend.ts

Script independente para testar a integração do Resend sem rodar o servidor completo.
Execute via terminal: npx ts-node src/tests/testResend.ts
*/
async function runTest() {
  if (!AUDIENCE_ID) {
    console.error("Missing RESEND_AUDIENCE_ID in .env");
    return;
  }

  try {
    const { data, error } = await resend.contacts.create({
      audienceId: AUDIENCE_ID,
      email: "test_hunter@example.com",
      firstName: "Test",
      lastName: "Hunter",
      unsubscribed: false,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return;
    }

    console.log("Success! Contact added to Resend Audience:", data);
  } catch (err) {
    console.error("Unexpected Error:", err);
  }
}

runTest();