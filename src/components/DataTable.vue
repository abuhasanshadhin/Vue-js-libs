<script setup>
import { watch, ref } from 'vue';

const props = defineProps({
    headers: { type: Array },
    items: { type: Array },
});

const sortBy = ref('');
const isAscending = ref(false);
const items = ref([]);

watch(() => props.items.length, () => {
    items.value = props.items;
}, { immediate: true });

const sortByColumn = (header) => {
    if (typeof header.value !== 'string') return;

    if (sortBy.value === header.value) {
        isAscending.value = !isAscending.value;
    } else {
        sortBy.value = header.value;
        isAscending.value = true;
    }
    
    const $items = props.items.slice();

    $items.sort((a, b) => {
        if (a[sortBy.value] > b[sortBy.value]) {
            return isAscending.value ? 1 : -1;
        } else if (a[sortBy.value] < b[sortBy.value]) {
            return isAscending.value ? -1 : 1;
        }
        
        return 0;
    });

    items.value = $items;
};

const isSortable = (header) => {
    if (typeof header.value !== 'string') return false;
    if (!('sortable' in header)) return true;
    if ('sortable' in header && header.sortable === true) return true;
    return false;
};
</script>

<template>
    <div class="table-responsive">
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th v-for="header in props.headers"
                        scope="col">
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
                <tr v-for="(item, i) in items">
                    <th scope="row">{{ ++i }}</th>
                    <td v-for="header in props.headers">
                        {{ typeof header.value === 'function'
                            ? header.value(item, i)
                            : (item[header.value] || '')
                        }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped lang="scss">
.sortable-column {
    cursor: pointer;
    user-select: none;
}

.sorting-icons {
    padding-top: 5px;

    @mixin common () {
        line-height: 8px;
        color: rgb(196, 196, 196);

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