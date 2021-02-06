
<template>
  <ul>
    <li>
      <label>タイトル</label>
    </li>
    <li>
      <input id="editMemoTitle" type="text" v-model="memo.title" />
    </li>
    <li>
      <label>メモ</label>
    </li>
    <li>
      <textarea id="editMemoContent" v-model="memo.content"> </textarea>
    </li>
    <li>
      <div class="buttons">
        <button class="button" @click="$emit('saveButtonClicked')">
          保存する
        </button>
        <button class="button" @click="$emit('deleteButtonClicked')">
          削除する
        </button>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
export interface Memo {
  id: Number;
  title: string;
  content: string;
}

import { PropType } from "vue";

export default {
  name: "EditMemo",
  props: {
    // Objectの部分は値のため、
    // 直接データ型を割り当てられない
    // 代わりにas PropType<データ型>でデータ型を示す
    memo: Object as PropType<Memo>,
  },
  emits: ["saveButtonClicked", "deleteButtonClicked"],
};
</script>

<style scoped>
ul {
  list-style-type: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1em;
}

ul li {
  display: inline-flex;
  width: 100%;
  margin: 0em;
  padding: 0em;
}

#editMemoTitle {
  flex: 1;
}

#editMemoContent {
  flex: 1;
  height: 20em;
  resize: none;
}

.buttons {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex: 1;
}

.button {
  margin: 1em;
  width: 8em;
}
</style>
