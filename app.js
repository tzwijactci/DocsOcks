require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.command("/upload-doc", async ({ command, ack, client }) => {
  try {
    await ack();

    await client.views.open({
      trigger_id: command.trigger_id,
      view: {
        type: "modal",
        callback_id: "upload_doc_form",
        title: {
          type: "plain_text",
          text: "Field Upload",
        },
        submit: {
          type: "plain_text",
          text: "Submit",
        },
        close: {
          type: "plain_text",
          text: "Cancel",
        },
        blocks: [
          {
            type: "input",
            block_id: "project",
            label: {
              type: "plain_text",
              text: "Project Number",
            },
            element: {
              type: "plain_text_input",
              action_id: "project_input",
              placeholder: {
                type: "plain_text",
                text: "Enter project number",
              },
            },
          },
          {
            type: "input",
            block_id: "notes",
            optional: true,
            label: {
              type: "plain_text",
              text: "Notes",
            },
            element: {
              type: "plain_text_input",
              action_id: "notes_input",
              multiline: true,
              placeholder: {
                type: "plain_text",
                text: "Enter notes",
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error("Command error:", error);
  }
});

app.view(
  "upload_doc_form",
  async ({ ack, body, view, client }) => {
    try {
      await ack();

      const project =
        view.state.values.project.project_input.value;

      const notes =
        view.state.values.notes.notes_input.value || "No notes provided";

      await client.chat.postMessage({
        channel: body.user.id,
        text:
          `✅ Upload form received\n\n` +
          `Project: ${project}\n` +
          `Notes: ${notes}`,
      });

      console.log("Submission received:", {
        user: body.user.id,
        project,
        notes,
      });
    } catch (error) {
      console.error("View submission error:", error);
    }
  }
);

(async () => {
  try {
    const port = process.env.PORT || 3000;

    await app.start(port);

    console.log(`⚡ Slack bot running on port ${port}`);
  } catch (error) {
    console.error("Startup error:", error);
  }
})();
