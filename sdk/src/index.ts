// (function () {
//   // 1. Chứng minh SDK đã được load
//   alert("Hello from SDK");

//   // 2. Chứng minh có thể truy cập DOM
//   const div = document.createElement("div");
//   div.innerText = "SDK injected this text";
//   div.style.position = "fixed";
//   div.style.bottom = "10px";
//   div.style.right = "10px";
//   div.style.background = "black";
//   div.style.color = "white";
//   div.style.padding = "8px";
//   document.body.appendChild(div);

//   // 3. Log để debug
//   console.log("[SDK] Loaded successfully");
// })();

(function () {
  console.log("TEST fetch()");

  fetch("https://jsonplaceholder.typicode.com/todos/1")
    .then(r => r.json())
    .then(data => {
      console.log("FETCH OK", data);
    })
    .catch(err => {
      console.error("FETCH FAIL", err);
      alert("fetch FAILED – xem console");
    });
})();

(function () {
  console.log("TEST XHR");

  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://jsonplaceholder.typicode.com/todos/1");
  xhr.onload = () => alert("XHR OK");
  xhr.onerror = () => alert("XHR FAIL");
  xhr.send();
})();

(function () {
  document.cookie = "test=123";
  alert(document.cookie || "COOKIE EMPTY");
})();

(function () {
  try {
    localStorage.setItem("x", "1");
    alert("localStorage OK");
  } catch (e) {
    alert("localStorage FAIL");
  }
})();