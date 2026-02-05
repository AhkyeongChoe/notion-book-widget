<!DOCTYPE html>
<html>
<body>
  <h3>노션 DB 추가 테스트</h3>

  <input id="title" placeholder="이름 입력" />
  <button onclick="add()">DB에 추가</button>

  <script>
    async function add() {
      const title = document.getElementById("title").value;

      await fetch("/api/addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });

      alert("추가 완료!");
    }
  </script>
</body>
</html>
