const WebSocket = require('ws');
const fetch = require('node-fetch');

// Định nghĩa URL của cơ sở dữ liệu Firebase Realtime Database
const dbUrl = "https://data-real-time-68gb-default-rtdb.asia-southeast1.firebasedatabase.app";

// URL WebSocket của trang web bạn muốn lắng nghe
// Hãy thay đổi URL này thành URL WebSocket thực tế mà bạn muốn theo dõi.
const targetWsUrl = "wss://example.com/your-websocket-path"; 

function connectWebSocket() {
  const ws = new WebSocket(targetWsUrl);

  ws.onopen = () => {
    console.log('✅ Đã kết nối thành công đến WebSocket.');
  };

  ws.onmessage = async (event) => {
    try {
      const text = event.data.toString();
      const len = text.length;

      if (text.includes("mnmdsbgamestart") || text.includes("mnmdsbgameend")) {
        const sessionType = text.includes("mnmdsbgamestart") ? "start" : "end";
        console.log("📥 PHIÊN " + sessionType.toUpperCase() + ":", text);

        const payload = {
          time: new Date().toISOString(),
          type: sessionType,
          data: text,
          length: len,
        };

        try {
          const res = await fetch(`${dbUrl}/taixiu_sessions.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            console.log("✅ Đã lưu phiên " + sessionType.toUpperCase() + " vào Firebase");
          } else {
            console.error("❌ Lỗi lưu phiên " + sessionType.toUpperCase() + ":", res.status);
          }
        } catch (fetchErr) {
          console.error("❌ Lỗi khi gửi dữ liệu lên Firebase:", fetchErr);
        }
      }
    } catch (err) {
      console.error("❌ Lỗi khi xử lý dữ liệu WebSocket:", err);
    }
  };

  ws.onclose = () => {
    console.log('⚠️ Mất kết nối đến WebSocket. Đang thử kết nối lại sau 5 giây...');
    setTimeout(connectWebSocket, 5000);
  };

  ws.onerror = (error) => {
    console.error('❌ Lỗi WebSocket:', error.message);
  };
}

// Bắt đầu kết nối
connectWebSocket();
