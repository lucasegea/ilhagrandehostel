// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const toggle = document.getElementById('navToggle');
const links = document.querySelector('.nav__links');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

// Booking form (front-end only demo)
const form = document.getElementById('bookingForm');
const note = document.getElementById('formNote');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const checkin = form.checkin.value;
    const checkout = form.checkout.value;
    if (checkin && checkout && checkout <= checkin) {
      alert('A data de check-out deve ser depois do check-in.');
      return;
    }
    note.hidden = false;
    form.reset();
  });
}
