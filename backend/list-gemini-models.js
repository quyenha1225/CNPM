require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Không tìm thấy GEMINI_API_KEY trong backend/.env"
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  console.log("Đang lấy danh sách model Gemini...\n");

  const models = await ai.models.list({
    config: {
      pageSize: 100,
    },
  });

  let count = 0;

  for await (const model of models) {
    const actions = model.supportedActions || [];

    if (actions.includes("generateContent")) {
      console.log({
        name: model.name,
        displayName: model.displayName,
        supportedActions: actions,
      });

      count += 1;
    }
  }

  console.log(
    `\nTìm thấy ${count} model hỗ trợ generateContent.`
  );
}

main().catch((error) => {
  console.error("\nLỖI LIỆT KÊ MODEL:");
  console.error(error);

  process.exit(1);
});