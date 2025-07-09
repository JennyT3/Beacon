export async function sendTelegramNotification(message: string) {
    const botToken = "7728293871:AAFyesN1K4CVV3hqYlUFJsX1xXKoofKPAic"
    const chatId = "343637849"
  
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      })
  
      const data = await res.json()
  
      if (!data.ok) {
        console.error("❌ Telegram error:", data)
      } else {
        console.log("✅ Telegram sent:", data.result.text)
      }
    } catch (err) {
      console.error("❌ Telegram fetch failed:", err)
    }
  }
  