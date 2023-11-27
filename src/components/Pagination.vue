<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    initPage: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
});

const emit = defineEmits(['page']);

const currentPage = ref(1);
const pages = ref([]);

const showLeftDots = ref(false);
const showRightDots = ref(false);

watch(() => props.initPage, (value) => {
    currentPage.value = value;
}, { immediate: true });

watch(currentPage, (page) => {
    let min = 0;
    let max = 0;
    let isLeftDots = false;
    let isRightDots = false;

    if (props.totalPages <= 5) {
        min = 2;
        max = 4;
    } else {
        if (page <= 4) {
            min = 2;
            max = 5;
            isRightDots = true;
        } else if (page > 4 && page < (props.totalPages - 3)) {
            min = currentPage.value - 1;
            max = currentPage.value + 1;
            isLeftDots = true;
            isRightDots = true;
        } else {
            min = props.totalPages - 4;
            max = props.totalPages - 1;
            isLeftDots = true;
            isRightDots = false;
        }
    }

    const tempPages = [];

    for (let i = min; i <= max; i++) {
        tempPages.push(i);
    }

    pages.value = tempPages;
    showLeftDots.value = isLeftDots;
    showRightDots.value = isRightDots;
}, { immediate: true });

const goTo = (page) => {
    if (currentPage.value === page) return;
    currentPage.value = page;
    emit('page', page);
}

const goToPrev = () => {
    if (currentPage.value > 1) {
        goTo(currentPage.value - 1);
    }
}

const goToNext = () => {
    if (currentPage.value < props.totalPages) {
        goTo(currentPage.value + 1);
    }
}
</script>

<template>
    <nav aria-label="Page navigation example">
        <ul class="pagination">
            <li :class="{ disabled: currentPage === 1 }"
                class="page-item">
                <button type="button"
                    @click="goToPrev"
                    class="page-link">Previous</button>
            </li>
            <li :class="{ active: currentPage === 1 }"
                class="page-item">
                <button type="button"
                    @click="goTo(1)"
                    class="page-link">1</button>
            </li>
            <li v-if="showLeftDots"
                class="page-item disabled">
                <button type="button"
                    class="page-link">...</button>
            </li>
            <li v-for="page in pages"
                :class="{ 'active': page == currentPage }"
                class="page-item">
                <button type="button"
                    @click="goTo(page)"
                    class="page-link">{{ page }}</button>
            </li>
            <li v-if="showRightDots"
                class="page-item disabled">
                <button type="button"
                    class="page-link">...</button>
            </li>
            <li :class="{ active: currentPage === totalPages }"
                class="page-item">
                <button type="button"
                    @click="goTo(totalPages)"
                    class="page-link">{{ totalPages }}</button>
            </li>
            <li :class="{ disabled: currentPage === totalPages }"
                class="page-item">
                <button type="button"
                    @click="goToNext"
                    class="page-link">Next</button>
            </li>
        </ul>
    </nav>
</template>

<style scoped lang="scss">
.pagination {
    .page-item {
        &.disabled {
            user-select: none;
        }
    }
}
</style>