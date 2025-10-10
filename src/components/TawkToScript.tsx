import { useEffect } from "react";

function TawkToScript() {
  useEffect(() => {
    var Tawk_API: any = Tawk_API || {};
    (function () {
      var s1 = document.createElement("script"),
        s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = "https://embed.tawk.to/6772ca6449e2fd8dfe00833f/1igc6d6rj";
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      s0.parentNode?.insertBefore(s1, s0);
    })();
  }, []);

  return null;
}

export default TawkToScript;
