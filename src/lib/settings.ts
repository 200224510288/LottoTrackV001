export const ITEM_PER_PAGE = 10;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/office_staff(.*)": ["office_staff"],
  "/agent(.*)": ["agent"],
  "/Homepage(.*)": ["agent"],
  "/MyOrder(.*)": ["agent"],
  "/OrderHistory(.*)": ["agent"],
  "/district_agent(.*)": ["district_agent"],
  "/list/agents": ["admin", "district_agent", "office_staff"],
  "/list/lotteries": ["admin", "district_agent", "office_staff"],
  "/list/staff": ["admin", "district_agent"],
 
};