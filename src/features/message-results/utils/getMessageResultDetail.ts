import messageResultsData from "@/features/message-results/data/message-results.json";
import messageResultDetailsData from "@/features/message-results/data/message-result-details.json";
import type {
  MessageResultDetail,
  MessageResultItem,
} from "@/features/message-results/types";

type DetailMeta = Omit<MessageResultDetail, keyof MessageResultItem>;

const list = messageResultsData.list as MessageResultItem[];
const detailsMeta = messageResultDetailsData.details as (DetailMeta & {
  id: number;
})[];

export function getMessageResultDetail(
  id: number,
): MessageResultDetail | undefined {
  const item = list.find((entry) => entry.id === id);
  const meta = detailsMeta.find((entry) => entry.id === id);

  if (!item || !meta) return undefined;

  const { id: _id, ...rest } = meta;

  return {
    ...item,
    ...rest,
  };
}
