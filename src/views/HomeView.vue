<script setup>
import { ref } from 'vue';
import Pagination from '../components/Pagination.vue';

const currentPage = ref(1);

const handlePageChange = (page) => {
    alert(page);
}
</script>

<template>
    <main class="m-3">
        <div class="container">
            <Pagination v-model="currentPage"
                :total-pages="50"
                @page="handlePageChange" />
        </div>
    </main>
</template>