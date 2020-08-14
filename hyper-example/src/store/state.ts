import { Page } from "./mutations";
import { getTodos } from "../services/todos";

export interface Todo {
  id: string;
  text: string;
  checked: boolean;
}

const credentials = JSON.parse(localStorage.getItem("credentials") || "null");

export interface State {
  username: string;
  showHeader: boolean;
  page: string;
  todos: Array<Todo>;
  errors: string;
  credentials: {
    username: string;
    password: string;
  };
}

export const createInitialState = (): State => ({
  username: null,
  showHeader: true,
  page: Page.Home,
  todos: getTodos(),
  errors: null,
  credentials,
});
