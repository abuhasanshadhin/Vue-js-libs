<script setup>
import { watch, ref } from 'vue';
import Pagination from './Pagination.vue';

const props = defineProps({
    headers: { type: Array },
    items: { type: Array },
    perPage: { type: Number, default: 10 },
});

const sortBy = ref('');
const isAscending = ref(false);
const $items = ref([]);
const offset = ref(0);
const limit = ref(0);
const totalPages = ref(1);
const showEntries = ref(10);

watch(() => props.items.length, () => {
    limit.value = props.perPage;
    $items.value = props.items.slice(0, props.perPage);
    const total = props.items.length / props.perPage;
    totalPages.value = Math.ceil(total);
}, { immediate: true });

const sortItems = () => {
    const copy = $items.value.slice();
    copy.sort((a, b) => {
        if (a[sortBy.value] > b[sortBy.value]) {
            return isAscending.value ? 1 : -1;
        } else if (a[sortBy.value] < b[sortBy.value]) {
            return isAscending.value ? -1 : 1;
        }
        return 0;
    });

    $items.value = copy;
};

const sortByColumn = (header) => {
    if (typeof header.value !== 'string') return;
    if (sortBy.value === header.value) {
        isAscending.value = !isAscending.value;
    } else {
        sortBy.value = header.value;
        isAscending.value = true;
    }

    sortItems();
};

const isSortable = (header) => {
    if (typeof header.value !== 'string') return false;
    if (!('sortable' in header)) return true;
    if ('sortable' in header && header.sortable === true) return true;
    return false;
};

const handlePageChange = (pageNum) => {
    limit.value = props.perPage * pageNum;
    offset.value = props.perPage * (pageNum - 1);
    $items.value = props.items.slice(offset.value, limit.value);
    sortItems();
};

watch(showEntries, () => {
    sortItems();
});
</script>

<template>
    <div class="clearfix mb-3">
        <div class="float-start d-flex justify-content-between">
            <div class="me-1">Show</div>
            <select v-model="showEntries"
                id="showEntries"
                class="form-select form-select-sm">
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
            </select>
            <div class="ms-1">entries</div>
        </div>
        <div class="float-end d-flex justify-content-between">
            <div class="me-1">Search:</div>
            <input type="text"
                class="form-control form-control-sm">
        </div>
    </div>
    <div class="table-responsive">
        <table class="table table-sm table-striped table-hover table-bordered mb-0">
            <thead>
                <tr>
                    <th scope="col"
                        class="text-center">#</th>
                    <th v-for="header in props.headers"
                        scope="col"
                        class="text-nowrap">
                        <div v-on="isSortable(header) ? { click: () => sortByColumn(header) } : {}"
                            :class="{ 'sortable-column': isSortable(header) }"
                            class="d-flex justify-content-between">
                            <div>{{ header.name }}</div>
                            <div v-if="isSortable(header)"
                                class="sorting-icons">
                                <div :class="{ active: sortBy === header.value && isAscending }"
                                    class="up">^</div>
                                <div :class="{ active: sortBy === header.value && !isAscending }"
                                    class="down">^</div>
                            </div>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, i) in $items">
                    <td scope="row"
                        class="text-center">{{ offset + i + 1 }}</td>
                    <td v-for="header in headers"
                        class="text-nowrap">
                        {{ typeof header.value === 'function'
                            ? header.value(item, i)
                            : (item[header.value] || '')
                        }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="clearfix mt-3">
        <div class="float-start small">
            Showing {{ offset }} to {{ limit }} of {{ items.length }} entries
        </div>
        <div class="float-end">
            <Pagination :total-pages="totalPages"
                @page="handlePageChange" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.sortable-column {
    cursor: pointer;
    user-select: none;
}

.sorting-icons {
    margin-top: 8px;
    margin-left: 5px;

    @mixin common () {
        line-height: 5px;
        color: rgb(196, 196, 196);
        font-size: 14px;

        &.active {
            color: rgba(0, 0, 0, 0.607);
        }
    }

    .up {
        @include common();
    }

    .down {
        @include common();
        transform: rotate(180deg);
    }
}</style>