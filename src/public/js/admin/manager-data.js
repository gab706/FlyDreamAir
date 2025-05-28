(async () => {
    // DOM references
    const $tbody = $('#client-storage-table-body');
    const $pagination = $('#client-storage-pagination');
    const itemsPerPage = 7;
    let currentPage = 1;

    const $modal = $('#cookie-view-modal');
    const $textarea = $('#cookie-view-textarea');

    const $editModal = $('#edit-storage-modal');
    const $editTextarea = $('#edit-storage-textarea');
    let editContext = { key: null, source: null };

    // Normalize storage source string for consistent handling
    function normalizeSource(source) {
        source = source.toLowerCase();
        return source === 'indexeddb' ? 'indexed' : source;
    }

    // Close view-only modal
    $('#close-cookie-view-modal').on('click', () => {
        $modal.addClass('hidden');
        $textarea.val('');
    });

    // Close edit modal and reset state
    $('#close-edit-storage-modal').on('click', () => {
        $editModal.addClass('hidden');
        $editTextarea.val('');
        editContext = { key: null, source: null };
    });

    // Populate modal textarea with formatted value
    function showModalWithValue(value) {
        try {
            $textarea.val(JSON.stringify(value, null, 2));
        } catch {
            $textarea.val(String(value));
        }
        $modal.removeClass('hidden');
    }

    // Parse document.cookie into structured objects
    function parseAllCookies() {
        return document.cookie
            .split(';')
            .map(line => line.trim())
            .filter(Boolean)
            .map(entry => {
                const [key, rawValue] = entry.split('=');
                let value;
                try {
                    value = decodeURIComponent(rawValue);
                    value = JSON.parse(value);
                } catch {
                    value = decodeURIComponent(rawValue);
                }
                return { source: 'Cookie', key, value };
            });
    }

    // Get all stored client data
    const cookieData = parseAllCookies();
    const indexedDataObj = await ClientStorageWrapper.getAllIndexedDBItems();
    const idbData = Object.entries(indexedDataObj).map(([key, value]) => ({
        source: 'IndexedDB',
        key,
        value
    }));

    const allEntries = [...cookieData, ...idbData];

    // Render a paginated page of entries
    function renderPage(page = 1) {
        $tbody.empty();
        $pagination.empty();

        if (!allEntries.length) {
            $tbody.append(`<tr><td colspan="4" class="text-center">No stored client data</td></tr>`);
            return;
        }

        const totalPages = Math.ceil(allEntries.length / itemsPerPage);
        const start = (page - 1) * itemsPerPage;
        const pageItems = allEntries.slice(start, start + itemsPerPage);

        // Render each entry row with preview and action buttons
        pageItems.forEach(({ source, key, value }) => {
            let preview;
            try {
                const raw = typeof value === 'string' ? value : JSON.stringify(value);
                preview = JSON.stringify(JSON.parse(raw), null, 2).slice(0, 50) + '...';
            } catch {
                preview = String(value).slice(0, 50) + '...';
            }

            $tbody.append(`
                <tr>
                    <td>${source}</td>
                    <td>${key}</td>
                    <td class="preview-cell" style="font-family: monospace; font-size: 0.9em;">${preview}</td>
                    <td>
                        <div class="table-actions">
                            <i class="fas fa-eye view-entry-btn" data-key="${key}" data-source="${source}" title="View Full"></i>
                            <i class="fas fa-edit edit-entry-btn" data-key="${key}" data-source="${source}" title="Edit"></i>
                            <i class="fas fa-trash delete-entry-btn" data-key="${key}" data-source="${source}" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `);
        });

        // Render pagination links if necessary
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                const active = i === page ? 'active' : '';
                $pagination.append(`<a href="#" class="client-page-btn ${active}" data-page="${i}">${i}</a> `);
            }
        }
    }

    // Handle pagination button clicks
    $pagination.on('click', '.client-page-btn', function (e) {
        e.preventDefault();
        const page = parseInt($(this).data('page'));
        if (page !== currentPage) {
            currentPage = page;
            renderPage(currentPage);
        }
    });

    // View full entry content
    $(document).on('click', '.view-entry-btn', async function () {
        const key = $(this).data('key');
        const source = normalizeSource($(this).data('source'));
        const value = await ClientStorageWrapper.get(key, source);
        showModalWithValue(value);
    });

    // Open editor with current value
    $(document).on('click', '.edit-entry-btn', async function () {
        const key = $(this).data('key');
        const source = normalizeSource($(this).data('source'));

        const value = await ClientStorageWrapper.get(key, source);
        let text = '';

        try {
            text = JSON.stringify(value, null, 2);
        } catch {
            text = String(value);
        }

        editContext = { key, source };
        $editTextarea.val(text);
        $editModal.removeClass('hidden');
    });

    // Save edited value back to storage
    $('#save-storage-edit').on('click', async () => {
        const raw = $editTextarea.val().trim();
        if (!raw)
            return $.notify('Cannot save empty content.', { className: 'error', position: 'top right' });

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch {
            return $.notify('Invalid JSON. Please correct before saving.', { className: 'error', position: 'top right' });
        }

        await ClientStorageWrapper.set(editContext.key, parsed, editContext.source, { days: 365 });
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: `Saved ${editContext.source} entry "${editContext.key}"`,
        });

        $editModal.addClass('hidden');
        $editTextarea.val('');
        editContext = { key: null, source: null };
        location.reload();
    });

    // Delete entry from storage
    $(document).on('click', '.delete-entry-btn', async function () {
        const key = $(this).data('key');
        const source = normalizeSource($(this).data('source'));

        if (!confirm(`Delete ${source} entry "${key}"?`)) return;

        await ClientStorageWrapper.remove(key, source);
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: `Deleted ${source} entry "${key}"`,
        });

        location.reload();
    });

    // Initial render
    renderPage(currentPage);
})();