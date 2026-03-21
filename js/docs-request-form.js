document.addEventListener("DOMContentLoaded", function () {
    var formBlocks = document.querySelectorAll(".docsForm__right");

    formBlocks.forEach(function (block) {
        var form = block.querySelector(".reqForm");
        var success = block.querySelector(".docsReqSuccess");

        if (!form || !success) {
            return;
        }

        form.addEventListener("submit", function (event) {
            if (!form.checkValidity()) {
                return;
            }

            event.preventDefault();
            form.style.display = "none";
            success.setAttribute("aria-hidden", "false");
            form.reset();
        });
    });
});

