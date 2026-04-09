const DEFAULT_EMAIL_ENDPOINT = "https://formspree.io/f/xwvrdeaw";

function isHttpUrl(value) {
    return /^https?:\/\//i.test(String(value || "").trim());
}

function resolveEndpoint(formElement, explicitEndpoint) {
    if (isHttpUrl(explicitEndpoint)) {
        return explicitEndpoint;
    }

    const action = formElement?.getAttribute("action") || "";
    if (isHttpUrl(action)) {
        return action;
    }

    return DEFAULT_EMAIL_ENDPOINT;
}

async function postFormData(endpoint, formData) {
    const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
            Accept: "application/json"
        }
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    if (!response.ok) {
        const message = payload?.errors?.[0]?.message || payload?.error || "Failed to send form";
        throw new Error(message);
    }

    return payload;
}

export function setSubmitButtonState(formElement, disabled) {
    if (!formElement) return;
    const submitButton = formElement.querySelector("button[type='submit']");
    if (submitButton) {
        submitButton.disabled = Boolean(disabled);
    }
}

export async function submitFormToEmail(formElement, options = {}) {
    const endpoint = resolveEndpoint(formElement, options.endpoint);
    const formData = new FormData(formElement);

    if (options.appendData && typeof options.appendData === "object") {
        Object.entries(options.appendData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });
    }

    return postFormData(endpoint, formData);
}

export function bindEmailForm(formElement, options = {}) {
    if (!formElement || formElement.dataset.emailSubmitBound === "true") {
        return;
    }

    const successElement = options.successElement || null;
    const errorElement = options.errorElement || null;
    const hideFormOnSuccess = options.hideFormOnSuccess !== false;

    formElement.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!formElement.checkValidity()) {
            formElement.reportValidity();
            return;
        }

        if (errorElement) {
            errorElement.textContent = "";
            errorElement.setAttribute("aria-hidden", "true");
        }

        setSubmitButtonState(formElement, true);

        try {
            await submitFormToEmail(formElement, options);

            if (typeof options.onSuccess === "function") {
                options.onSuccess(formElement, successElement);
            }

            if (hideFormOnSuccess) {
                formElement.style.display = "none";
            }

            if (successElement) {
                successElement.setAttribute("aria-hidden", "false");
            }

            formElement.reset();
        } catch (error) {
            if (typeof options.onError === "function") {
                options.onError(error, formElement, errorElement);
            } else if (errorElement) {
                errorElement.textContent = options.errorMessage || "Помилка відправлення. Спробуйте ще раз.";
                errorElement.setAttribute("aria-hidden", "false");
            }
        } finally {
            setSubmitButtonState(formElement, false);
        }
    });

    formElement.dataset.emailSubmitBound = "true";
}

