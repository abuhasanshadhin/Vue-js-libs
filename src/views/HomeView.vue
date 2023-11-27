<script setup>
import Pagination from '../components/Pagination.vue';

const handlePageChange = (page) => {
    console.log(page);
}
</script>

<template>
    <main class="m-3">
        <div class="container">
            <Pagination @page="handlePageChange"
                :total-pages="7" />
        </div>
    </main>
</template>