// Generated by Xata Codegen 0.29.4. Please do not edit.
import { buildClient } from "@xata.io/client";
import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";

const tables = [
  {
    name: "History",
    columns: [
      { name: "uniqueid", type: "string" },
      { name: "user_text", type: "string" },
    ],
  },
  {
    name: "Chat_history",
    columns: [
      { name: "uniqueid", type: "string" },
      { name: "pdf_url", type: "string" },
      { name: "text", type: "json" },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type History = InferredTypes["History"];
export type HistoryRecord = History & XataRecord;

export type ChatHistory = InferredTypes["Chat_history"];
export type ChatHistoryRecord = ChatHistory & XataRecord;

export type DatabaseSchema = {
  History: HistoryRecord;
  Chat_history: ChatHistoryRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL:
    "https://Navin-R-C-s-workspace-k10o4o.us-east-1.xata.sh/db/navin_chatbot",
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient();
  return instance;
};
