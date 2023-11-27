<script setup>
import { watch, ref, computed } from 'vue';
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

watch(() => props.items.length, () => {
    $items.value = props.items.slice(0, props.perPage);
    limit.value = props.perPage;
}, { immediate: true });

const totalPages = computed(() => {
    const total = props.items.length / props.perPage;
    return Math.ceil(total);
});

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
</script>

<template>
    <div class="table-responsive">
        <table class="table table-bordered mb-0">
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
                    <th scope="row"
                        class="text-center">{{ offset + i + 1 }}</th>
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
    <div class="clearfix mt-2">
        <div class="float-start">
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
}
</style>