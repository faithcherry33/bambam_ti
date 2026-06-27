// api/gemini-counseling.js - Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const { studentAlias, gradeSummary, learningTraits, teacherConcern } = req.body || {};
  if (!studentAlias || !gradeSummary || !learningTraits || !teacherConcern) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: "GEMINI_API_KEY 환경 변수가 설정되지 않았습니다." });
  }

  const prompt = `You are an AI assistant that helps teachers create counseling strategies for students. Do NOT make definitive diagnoses. Provide output in Korean with the following sections:\n1. 현재 상황 요약\n2. 학생 데이터 기반 해석\n3. 상담 접근 전략\n4. 교사가 던질 수 있는 질문 3개\n5. 피해야 할 말 또는 주의점\n6. 다음 수업에서 해볼 수 있는 작은 지원\n\nStudent Data:\n- Alias: ${studentAlias}\n- Grade Summary: ${gradeSummary}\n- Learning Traits: ${learningTraits}\nTeacher Concern: ${teacherConcern}\n`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errText}`);
    }
    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ success: true, result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: e.message });
  }
}
