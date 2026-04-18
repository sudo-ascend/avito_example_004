const siteConfig = {
  brandName: "Bloom Atelier",
  phoneDisplay: "+7 (999) 123-45-67",
  phoneHref: "+79991234567",
  whatsappNumber: "79991234567",
  telegramHandle: "bloomatelier",
  address: "Москва, Большая Никитская, 18",
  hours: "Ежедневно, 09:00-21:00",
};

const messageTemplates = {
  default: "Здравствуйте! Хочу заказать букет на сайте Bloom Atelier.",
  bouquet: (name) => `Здравствуйте! Хочу заказать букет "${name}".`,
};

const header = document.querySelector(".header");
const nav = document.querySelector(".header__nav");
const navToggle = document.querySelector(".header__toggle");
const phoneInput = document.querySelector("#phone");
const leadForm = document.querySelector("#lead-form");
const bouquetInput = document.querySelector("#selected-bouquet");
const commentInput = document.querySelector("#comment");
const formMessage = document.querySelector("#form-message");
const policyModal = document.querySelector("#policy-modal");

applySiteConfig();
setupHeader();
setupRevealAnimations();
setupOrderTriggers();
setupPhoneFormatting();
setupForm();
setupPolicyModal();
setCurrentYear();

function applySiteConfig() {
  const whatsappUrl = buildWhatsAppLink(messageTemplates.default);
  const telegramUrl = `https://t.me/${siteConfig.telegramHandle}`;
  const telUrl = `tel:${siteConfig.phoneHref}`;

  document.querySelectorAll("[data-brand-name]").forEach((node) => {
    node.textContent = siteConfig.brandName;
  });

  document.querySelectorAll("[data-phone-label]").forEach((node) => {
    node.textContent = siteConfig.phoneDisplay;
  });

  document.querySelectorAll("[data-phone-link]").forEach((node) => {
    node.setAttribute("href", telUrl);
  });

  document.querySelectorAll("[data-whatsapp-link]").forEach((node) => {
    node.setAttribute("href", whatsappUrl);
  });

  document.querySelectorAll("[data-telegram-link]").forEach((node) => {
    node.setAttribute("href", telegramUrl);
  });

  document.querySelectorAll("[data-address]").forEach((node) => {
    node.textContent = siteConfig.address;
  });

  document.querySelectorAll("[data-hours]").forEach((node) => {
    node.textContent = siteConfig.hours;
  });
}

function buildWhatsAppLink(text) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function setupHeader() {
  if (!header || !nav || !navToggle) {
    return;
  }

  const updateHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  const closeMenu = () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) {
      return;
    }

    if (!nav.contains(event.target) && !navToggle.contains(event.target)) {
      closeMenu();
    }
  });

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!revealItems.length) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupOrderTriggers() {
  const orderButtons = document.querySelectorAll(".order-trigger");
  const contactSection = document.querySelector("#contact");

  if (!orderButtons.length || !contactSection || !bouquetInput || !commentInput || !formMessage) {
    return;
  }

  orderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const bouquetName = button.dataset.bouquet || "Букет без названия";

      bouquetInput.value = bouquetName;
      commentInput.value = `Хочу заказать букет "${bouquetName}".`;
      contactSection.scrollIntoView({ behavior: "smooth", block: "start" });

      formMessage.textContent = `Выбран букет: ${bouquetName}`;
      formMessage.dataset.state = "info";

      window.setTimeout(() => {
        commentInput.focus({ preventScroll: true });
      }, 350);
    });
  });
}

function setupPhoneFormatting() {
  if (!phoneInput) {
    return;
  }

  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatPhone(phoneInput.value);
    clearFieldError("phone");
  });
}

function formatPhone(value) {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  let normalized = digitsOnly;

  if (normalized.startsWith("8")) {
    normalized = `7${normalized.slice(1)}`;
  } else if (!normalized.startsWith("7")) {
    normalized = `7${normalized}`;
  }

  normalized = normalized.slice(0, 11);

  let result = "+7";

  if (normalized.length > 1) {
    result += ` (${normalized.slice(1, 4)}`;
  }

  if (normalized.length >= 4) {
    result += ")";
  }

  if (normalized.length > 4) {
    result += ` ${normalized.slice(4, 7)}`;
  }

  if (normalized.length > 7) {
    result += `-${normalized.slice(7, 9)}`;
  }

  if (normalized.length > 9) {
    result += `-${normalized.slice(9, 11)}`;
  }

  return result;
}

function setupForm() {
  if (!leadForm || !formMessage) {
    return;
  }

  ["name", "comment"].forEach((fieldName) => {
    const field = leadForm.querySelector(`[name="${fieldName}"]`);
    field?.addEventListener("input", () => {
      clearFieldError(fieldName);
    });
  });

  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      comment: String(formData.get("comment") || "").trim(),
      bouquet: String(formData.get("selectedBouquet") || "").trim(),
    };

    const isValid = validateForm(payload);

    if (!isValid) {
      formMessage.textContent = "Проверьте поля формы и попробуйте еще раз.";
      formMessage.dataset.state = "error";
      return;
    }

    const submitButton = leadForm.querySelector('button[type="submit"]');
    const initialButtonText = submitButton ? submitButton.textContent : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Отправляем...";
    }

    formMessage.textContent = "";
    delete formMessage.dataset.state;

    try {
      // Точка подключения backend:
      // замените setTimeout на fetch('/api/leads', { method: 'POST', body: JSON.stringify(payload) })
      // и отправляйте payload в CRM, почту или бота.
      await new Promise((resolve) => window.setTimeout(resolve, 900));

      const selectedBouquet = payload.bouquet;

      leadForm.reset();
      if (bouquetInput) {
        bouquetInput.value = "";
      }

      formMessage.textContent = selectedBouquet
        ? `Спасибо. Заявка на букет "${selectedBouquet}" отправлена, свяжемся с вами в ближайшее время.`
        : "Спасибо. Заявка отправлена, свяжемся с вами в ближайшее время.";
      formMessage.dataset.state = "success";
    } catch (error) {
      formMessage.textContent =
        "Не удалось отправить заявку. Попробуйте еще раз или напишите нам в WhatsApp.";
      formMessage.dataset.state = "error";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = initialButtonText;
      }
    }
  });
}

function validateForm(payload) {
  let valid = true;

  clearFieldError("name");
  clearFieldError("phone");
  clearFieldError("comment");

  if (payload.name.length < 2) {
    setFieldError("name", "Введите имя, чтобы мы знали, как к вам обращаться.");
    valid = false;
  }

  const phoneDigits = payload.phone.replace(/\D/g, "");
  if (phoneDigits.length !== 11 || !phoneDigits.startsWith("7")) {
    setFieldError("phone", "Укажите корректный номер в формате +7.");
    valid = false;
  }

  if (payload.comment.length > 0 && payload.comment.length < 8) {
    setFieldError("comment", "Комментарий слишком короткий. Добавьте хотя бы несколько слов.");
    valid = false;
  }

  return valid;
}

function setFieldError(fieldName, message) {
  const field = document.querySelector(`[name="${fieldName}"]`);
  const error = document.querySelector(`[data-error-for="${fieldName}"]`);

  if (field) {
    field.setAttribute("aria-invalid", "true");
  }

  if (error) {
    error.textContent = message;
  }
}

function clearFieldError(fieldName) {
  const field = document.querySelector(`[name="${fieldName}"]`);
  const error = document.querySelector(`[data-error-for="${fieldName}"]`);

  if (field) {
    field.setAttribute("aria-invalid", "false");
  }

  if (error) {
    error.textContent = "";
  }
}

function setupPolicyModal() {
  if (!policyModal) {
    return;
  }

  const openButtons = document.querySelectorAll("[data-policy-open]");
  const closeButton = document.querySelector("[data-policy-close]");

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (typeof policyModal.showModal === "function") {
        policyModal.showModal();
      }
    });
  });

  closeButton?.addEventListener("click", () => {
    policyModal.close();
  });

  policyModal.addEventListener("click", (event) => {
    const bounds = policyModal.getBoundingClientRect();
    const clickedOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedOutside) {
      policyModal.close();
    }
  });
}

function setCurrentYear() {
  const currentYearNode = document.querySelector("#current-year");

  if (currentYearNode) {
    currentYearNode.textContent = String(new Date().getFullYear());
  }
}
