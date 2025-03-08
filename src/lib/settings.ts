export const ITEM_PER_PAGE = 15

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/office_staff(.*)": ["office_staff"],
  "/agent(.*)": ["agent"],
  "/district_agent(.*)": ["district_agent"],
  "/list/agents": ["admin", "district_agent", "office_staff"],


};