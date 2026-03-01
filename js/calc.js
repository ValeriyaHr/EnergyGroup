//Калькулятор

function toNum(v){
    // підтримка коми 4,5
    const n = Number(String(v).trim().replace(",", "."));
    return Number.isFinite(n) ? n : null;
}

function openModal(id){
    $("#" + id).addClass("is-open");
    $("body").addClass("no-scroll");
}

function closeModal(id){
    $("#" + id).removeClass("is-open");
    $("body").removeClass("no-scroll");
}
// Обробка відправки форми
function ShowCalcResult(){


    const inom = toNum($('#inom').val());
    const rho = toNum($('#rho').val());

    console.log('inom=' + inom);
    console.log('rho=' + rho);

    if (inom === null || rho === null || inom <= 0 || rho <= 0) {
        alert("Перевір числа: мають бути > 0 (можна 4,0 або 4.0).");
        return;
    }

    // Константи з твоєї таблиці
    const K_max_I = 1.5;
    const U_skz_max = 50;
    const K_zapas_U = 1.5;
    const K_zapas_R = 1.3;
    const K_season = 1.3;
    const K_ekr = 0.75;
    const V_anod = 0.02;
    const T_years = 20;
    const K_nerivn = 2;
    const M_core = 6;

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

    $("#calc-result-value").text(String(N_final));
    closeModal("calc-modal");
    openModal("calc-modal-result");
}

(function initAzCalculator(){
    const $modal = $("#calc-modal");
    const $resultModal = $("#calc-modal-result");
    if ($modal.length === 0 || $resultModal.length === 0) return;

    // Закриття модалей при кліку на overlay або кнопку close
    $(document).on("click", ".calc-modal__close", function(e) {
        e.stopPropagation();
        const $modal = $(this).closest("#calc-modal, #calc-modal-result");
        if ($modal.length) {
            const modalId = $modal.attr("id");
            if (modalId) {
                closeModal(modalId);
            }
        }
    });

    // Альтернативна логіка: закриття при кліку на overlay
    $(document).on("click", ".calc-modal__overlay", function(e) {
        e.stopPropagation();
        const $modal = $(this).closest(".calc-modal");
        if ($modal.length) {
            closeModal($modal.attr("id"));
        }
    });

    // Виклик з кнопки на картці товару:
    // <button data-calc-open>Калькулятор</button>
    $(document).on("click", "[data-calc-open]", function() {
        openModal("calc-modal");
    });

    const $form = $("#calc-form");



})();