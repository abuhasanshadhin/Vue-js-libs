<template>
    <main class="m-3">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <Editor v-model="content" />
                    {{ content }}
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref } from 'vue';
import Editor from '../components/Editor.vue';

const content = ref('');
</script>
