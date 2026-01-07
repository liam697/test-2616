(() => {
  // src/index.ts
  (function() {
    console.log("TEST fetch()");
    fetch("https://jsonplaceholder.typicode.com/todos/1").then((r) => r.json()).then((data) => {
      console.log("FETCH OK", data);
    }).catch((err) => {
      console.error("FETCH FAIL", err);
      alert("fetch FAILED \u2013 xem console");
    });
  })();
  (function() {
    console.log("TEST XHR");
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://jsonplaceholder.typicode.com/todos/1");
    xhr.onload = () => alert("XHR OK");
    xhr.onerror = () => alert("XHR FAIL");
    xhr.send();
  })();
  (function() {
    document.cookie = "test=123";
    alert(document.cookie || "COOKIE EMPTY");
  })();
  (function() {
    try {
      localStorage.setItem("x", "1");
      alert("localStorage OK");
    } catch (e) {
      alert("localStorage FAIL");
    }
  })();
})();
