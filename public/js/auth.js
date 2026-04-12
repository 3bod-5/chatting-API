// Simple form validation
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', function(e) {
    const inputs = this.querySelectorAll('input[required]');
    
    for (let input of inputs) {
      if (!input.value.trim()) {
        e.preventDefault();
        alert('Please fill in all required fields');
        return;
      }
    }

    // For register form, check password match
    const passwordInput = this.querySelector('input[name="password"]');
    const confirmInput = this.querySelector('input[name="confirmPassword"]');
    
    if (passwordInput && confirmInput) {
      if (passwordInput.value !== confirmInput.value) {
        e.preventDefault();
        alert('Passwords do not match');
        return;
      }
      
      if (passwordInput.value.length < 6) {
        e.preventDefault();
        alert('Password must be at least 6 characters');
        return;
      }
    }
  });
});