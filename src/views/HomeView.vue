<script setup>
import { ref } from 'vue';
import DataTable from '../components/DataTable.vue';
import { faker } from '@faker-js/faker';

const headers = [
    { name: 'First Name', value: 'first_name' },
    { name: 'Last Name', value: 'last_name' },
    { name: 'Gender', value: 'gender' },
    { name: 'Age', value: 'age' },
    { name: 'Phone', value: 'phone' },
    { name: 'City', value: 'city' },
    { name: 'Country', value: 'country' },
    { name: 'Zip Code', value: 'zip_code' },
];

const users = ref([]);
const _users = [];

for (let i = 0; i < 1000; i++) {
    _users.push({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        gender: faker.person.sex(),
        age: faker.number.int(75),
        phone: faker.phone.number(),
        city: faker.location.city(),
        country: faker.location.country(),
        zip_code: faker.location.zipCode(),
    });
}

users.value = _users;
</script>

<template>
    <main class="m-3">
        <div class="container">
            <DataTable :headers="headers"
                :items="users"></DataTable>
        </div>
    </main>
</template>