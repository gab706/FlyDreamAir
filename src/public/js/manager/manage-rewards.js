(async () => {
    const $tbody = $('#reward-table-body');
    const $pagination = $('#reward-pagination');
    const $createModal = $('#create-reward-modal');
    const $editModal = $('#edit-reward-modal');
    const $createForm = $('#create-reward-form');
    const $editForm = $('#edit-reward-form');

    let editingRewardId = null;
    let currentPage = 1;
    const perPage = 7;

    const rewards = await ClientStorageSolutions.fetchRewards() || [];

    function renderPage(page = 1) {
        $tbody.empty();
        $pagination.empty();

        const totalPages = Math.ceil(rewards.length / perPage);
        const start = (page - 1) * perPage;
        const pageRewards = rewards.slice(start, start + perPage);

        if (!pageRewards.length) {
            $tbody.append(`<tr><td colspan="7" class="text-center">No rewards found</td></tr>`);
            return;
        }

        pageRewards.forEach(r => {
            const purchHTML = r.purchasable
                ? `<i class="fas fa-check-circle" style="color:#4caf50" title="Purchasable"></i><span style="margin-left:0.5em;">${r.price} pts</span>`
                : `<i class="fas fa-times-circle" style="color:#f44336" title="Not Purchasable"></i>`;

            $tbody.append(`
                <tr>
                    <td>${r.name}</td>
                    <td>${r.description}</td>
                    <td>${r.type}</td>
                    <td>
                        <div class="reward-image-wrapper">
                            <img src="${r.image}" alt="Reward Image" class="reward-thumb" />
                            <div class="reward-image-preview"><img src="${r.image}" alt="Preview" /></div>
                        </div>
                    </td>
                    <td><span class="tier-pill ${r.tier.toLowerCase()}">${r.tier}</span></td>
                    <td class="purchase-status">${purchHTML}</td>
                    <td>
                        <div class="table-actions">
                            <i class="fas fa-edit action-edit-reward" data-reward-id="${r.id}" title="Edit"></i>
                            <i class="fas fa-trash action-delete-reward" data-reward-id="${r.id}" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `);
        });

        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                $pagination.append(`<a href="#" class="reward-page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</a>`);
            }
        }
    }

    $pagination.on('click', '.reward-page-btn', function (e) {
        e.preventDefault();
        const page = +$(this).data('page');
        if (page !== currentPage) {
            currentPage = page;
            renderPage(currentPage);
        }
    });

    $('#open-create-reward-modal').on('click', () => $createModal.removeClass('hidden'));
    $('#close-create-reward-modal').on('click', () => $createModal.addClass('hidden'));
    $createModal.on('click', e => { if (e.target === e.currentTarget) $createModal.addClass('hidden'); });

    $('#close-edit-reward-modal').on('click', () => $editModal.addClass('hidden'));
    $editModal.on('click', e => { if (e.target === e.currentTarget) $editModal.addClass('hidden'); });

    const togglePriceInput = (toggleSelector, wrapperSelector) => {
        $(toggleSelector).on('change', function () {
            if (this.checked) $(wrapperSelector).removeClass('hidden');
            else $(wrapperSelector).addClass('hidden');
        });
        $(toggleSelector).trigger('change');
    };

    togglePriceInput('#create-reward-form input[name="purchasable"]', '#create-price-wrapper');
    togglePriceInput('#edit-reward-form input[name="purchasable"]', '#edit-price-wrapper');

    $createForm.on('submit', async function (e) {
        e.preventDefault();

        const data = {
            name: this.name.value.trim(),
            description: this.description.value.trim(),
            type: this.type.value,
            image: this.image.value.trim(),
            tier: this.tier.value,
            purchasable: this.purchasable.checked,
            price: this.purchasable.checked ? parseInt(this.price.value, 10) || 0 : null
        };

        await ClientStorageSolutions.createReward(data);
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: `Created reward "${data.name}" successfully.`,
        });
        $createModal.addClass('hidden');
        this.reset();
        location.reload();
    });

    $(document).on('click', '.action-edit-reward', async function () {
        const id = $(this).data('reward-id');
        const reward = await ClientStorageSolutions.fetchRewards(id);
        if (!reward) return;

        editingRewardId = id;

        $editForm[0].name.value = reward.name;
        $editForm[0].description.value = reward.description;
        $editForm[0].type.value = reward.type;
        $editForm[0].image.value = reward.image;
        $editForm[0].tier.value = reward.tier;
        $editForm[0].purchasable.checked = reward.purchasable;
        $editForm[0].price.value = reward.purchasable && reward.price ? reward.price : '';
        if (reward.purchasable) $('#edit-price-wrapper').removeClass('hidden');
        else $('#edit-price-wrapper').addClass('hidden');

        $editModal.removeClass('hidden');
    });

    $editForm.on('submit', async function (e) {
        e.preventDefault();
        const updates = {
            name: this.name.value.trim(),
            description: this.description.value.trim(),
            type: this.type.value,
            image: this.image.value.trim(),
            tier: this.tier.value,
            purchasable: this.purchasable.checked,
            price: this.purchasable.checked ? parseInt(this.price.value, 10) || 0 : null
        };

        await ClientStorageSolutions.updateReward(editingRewardId, updates);
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: `Edited reward "${this.name.value.trim()}" successfully.`,
        });
        $editModal.addClass('hidden');
        this.reset();
        editingRewardId = null;
        location.reload();
    });

    $(document).on('click', '.action-delete-reward', async function () {
        const id = $(this).data('reward-id');
        if (!confirm(`Delete reward ID "${id}"?`)) return;
        await ClientStorageSolutions.deleteReward(id);
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: `Deleted reward "${id}" successfully.`,
        });
        location.reload();
    });

    $(document).on('mouseenter', '.reward-thumb', function (e) {
        const src = $(this).attr('src');
        $('#reward-preview').html(`<img src="${src}" style="max-width:320px;max-height:320px;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.2);border:1px solid #ccc;" />`);
        $('#reward-preview').css({ top: e.clientY + 15, left: e.clientX + 15, display: 'block' });
    });

    $(document).on('mousemove', '.reward-thumb', function (e) {
        $('#reward-preview').css({ top: e.clientY + 15, left: e.clientX + 15 });
    });

    $(document).on('mouseleave', '.reward-thumb', function () {
        $('#reward-preview').hide();
    });

    renderPage(currentPage);
})();