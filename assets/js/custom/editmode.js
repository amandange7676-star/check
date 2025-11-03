$(document).on('click', '.edit-site', function (event, clientname, clientproject) {
    event.preventDefault();

    const filename = $(this).attr("href");
    const requestFrom = $(this).attr("src") || "";

    // Prefer parameters if provided
    let clientName = clientname || getCookie('clientName');
    let clientProjectName = clientproject || getCookie('projectName');

    if (!clientName || !clientProjectName) {
        alert("Client or project not found!");
        return false;
    }

    const newTab = window.open("about:blank", "_blank");
    if (!newTab) {
        alert("Popup blocked! Please allow popups for this site.");
        return false;
    }

    newTab.document.write("<h2 style='font-family:sans-serif;padding:20px;'>Loading page editor...</h2>");
    newTab.document.close();

    $.ajax({
        type: 'POST',
        url: "es/",
        data: {
            clientName,
            clientProjectName,
            srcReq: filename
        },
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        },
        success: function (data) {
            newTab.document.open();
            newTab.document.write(`<base href="${window.location.origin}/">`);
            newTab.document.write(data);
            newTab.document.close();

            newTab.onload = function () {
                function appendElement(tag, attributes, toBody) {
                    const el = newTab.document.createElement(tag);
                    for (const attr in attributes) el.setAttribute(attr, attributes[attr]);
                    (toBody ? newTab.document.body : newTab.document.head).appendChild(el);
                }

                appendElement('link', { rel: 'stylesheet', href: 'https://cdn.quilljs.com/1.3.6/quill.snow.css' });
                appendElement('link', { rel: 'stylesheet', href: 'assets/css/custom/editmode.css' });
                appendElement('link', { rel: 'stylesheet', href: 'assets/css/custom/custom.css' });
                appendElement('script', { src: 'https://cdn.quilljs.com/1.3.6/quill.min.js' }, true);
                appendElement('script', { src: 'assets/js/custom/main.js' }, true);
                appendElement('script', { src: 'assets/js/custom/editmode.js' }, true);
                appendElement('script', { src: 'assets/js/custom/editModeScript.js' }, true);

                const hidden = newTab.document.createElement('input');
                hidden.type = 'hidden';
                hidden.className = 'hidden selectedPageName';
                hidden.name = 'selectedPageName';
                hidden.value = filename;
                newTab.document.body.appendChild(hidden);

                newTab.document.querySelectorAll('a').forEach(a => a.classList.add('edit-site'));
            };
        },
        error: function (xhr) {
            newTab.document.open();
            newTab.document.write(`<p style="color:red;padding:20px;">Error: ${xhr.responseJSON?.errorMessage || 'Unknown error'}</p>`);
            newTab.document.close();
        }
    });
});
