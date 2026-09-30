const redirectUrl = "/";
let countdown = 5;

const startCountdown = () => {
  document.getElementById("redirectMsg").textContent =
    countdown + "초 뒤에 홈페이지로 이동합니다.";

  if (countdown > 0) {
    countdown--;
    try {
      setTimeout(startCountdown, 1000);
    } catch {
      window.location.replace(redirectUrl);
    }
  } else {
    window.location.replace(redirectUrl);
  }
};

window.onload = function () {
  startCountdown();
};
