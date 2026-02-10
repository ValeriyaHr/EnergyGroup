//Калькулятор

function toNum(v){
    // підтримка коми 4,5
    const n = Number(String(v).trim().replace(",", "."));
    return Number.isFinite(n) ? n : null;
}

function openModal(id){
    const m = document.getElementById(id);
    m.setAttribute("aria-hidden", "false");
}

function closeModal(modal){
    modal.setAttribute("aria-hidden", "true");
}

(function initAzCalculator(){
    const modal = document.getElementById("az-calc");
    if (!modal) return;

    modal.addEventListener("click", (e) => {
        if (e.target.matches("[data-close]")) closeModal(modal);
    });

    // Виклик з кнопки на картці товару:
    // <button data-az-open>Калькулятор</button>
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-az-open]");
        if (btn) openModal("az-calc");
    });

    const form = document.getElementById("az-form");
    const result = document.getElementById("az-result");
    const nEl = document.getElementById("az-n");
    const metaEl = document.getElementById("az-meta");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const inom = toNum(form.inom.value);
        const rho = toNum(form.rho.value);

        if (inom === null || rho === null || inom <= 0 || rho <= 0) {
            result.hidden = false;
            nEl.textContent = "—";
            metaEl.textContent = "Перевір числа: мають бути > 0 (можна 4,0 або 4.0).";
            return;
        }

        // Константи з твоєї таблиці
        const K_max_I = 1.5;
        const U_skz_max = 50;
        const K_zapas_U = 1.5;
        const K_zapas_R = 1.3;
        const K_season = 1.3;
        const K_ekr = 0.75;
        const V_anod = 0.02;   // кг/(A*рік)
        const T_years = 20;
        const K_nerivn = 2;
        const M_core = 6;      // кг

        // Розрахунки
        const I_max = inom * K_max_I;
        const U_start = U_skz_max / K_zapas_U;
        const R_calc = U_start / inom;
        const R_start = R_calc / K_zapas_R;

        const Ri_base = 5 * 0.1 * rho;
        const Ri = Ri_base * K_season;

        const N_electr = Ri / R_start;
        const N_fact = N_electr / K_ekr;

        const M_az = V_anod * T_years * inom * K_nerivn;
        const N_by_mass = M_az / M_core;

        const N_final = Math.ceil(Math.max(N_fact, N_by_mass));

        result.hidden = false;
        nEl.textContent = String(N_final);
        metaEl.textContent =
            `Imax=${I_max.toFixed(2)}A, Uпоч=${U_start.toFixed(2)}V, Nфакт=${N_fact.toFixed(2)}, Nпо масі=${N_by_mass.toFixed(2)}.`;
    });
})();