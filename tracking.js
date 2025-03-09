document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  if (orderId) {
    document.getElementById('orderId').textContent = `Order ID: ${orderId}`;
    
    // Simulate order status updates
    const steps = document.querySelectorAll('.status-step');
    let currentStep = 0;

    function updateStatus() {
      if (currentStep < steps.length) {
        steps[currentStep].classList.add('active');
        currentStep++;
        if (currentStep < steps.length) {
          setTimeout(updateStatus, Math.random() * 5000 + 3000);
        }
      }
    }

    // Start status updates after a short delay
    setTimeout(updateStatus, 2000);
  } else {
    document.querySelector('.tracking-container').innerHTML = `
      <h2>Order Not Found</h2>
      <p>Please check your order ID and try again.</p>
      <a href="/" class="back-button">Back to Home</a>
    `;
  }
});