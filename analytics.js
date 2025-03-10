function enableTracking() {
  console.log("Tracking")
    let script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-KJXRFPRM1R";
    script.async = true;
    document.head.appendChild(script);

    script.onload = function () {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", "G-KJXRFPRM1R");
    };
  }