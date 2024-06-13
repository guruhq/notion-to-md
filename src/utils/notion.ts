import { Client } from "@notionhq/client";
import { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";
import { ListBlockChildrenResponseResults, BlockCounter } from "../types";

export const getBlockChildren = async (
  notionClient: Client,
  block_id: string,
  totalPage: number | null,
  blockCounter: BlockCounter | null
) => {
  let result: ListBlockChildrenResponseResults = [];
  if (blockCounter && blockCounter.blockCount >= blockCounter.maxBlocks) {
    return result;
  }
  let pageCount = 0;
  let start_cursor = undefined;

  do {
    const response = (await notionClient.blocks.children.list({
      start_cursor: start_cursor,
      block_id: block_id,
    })) as ListBlockChildrenResponse;
    result.push(...response.results);

    if (blockCounter) {
      blockCounter.blockCount += response.results.length;
    }
    start_cursor = response?.next_cursor;
    pageCount += 1;
  } while (
    start_cursor != null &&
    (totalPage == null || pageCount < totalPage) &&
    (blockCounter == null || blockCounter.blockCount < blockCounter.maxBlocks)
  );

  modifyNumberedListObject(result);
  return result;
};

export const modifyNumberedListObject = (
  blocks: ListBlockChildrenResponseResults
) => {
  let numberedListIndex = 0;

  for (const block of blocks) {
    if ("type" in block && block.type === "numbered_list_item") {
      // add numbers
      // @ts-ignore
      block.numbered_list_item.number = ++numberedListIndex;
    } else {
      numberedListIndex = 0;
    }
  }
};
