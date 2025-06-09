import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ArcheryPlace.module.css";
import "../../../css/CustomMarker.css";
import { GoSearch } from "react-icons/go";
import { FaChevronLeft } from "react-icons/fa6"; // <FaChevronLeft />
import { FaChevronRight } from "react-icons/fa6"; // <FaChevronRight />
import { FaLocationPin } from "react-icons/fa6"; // <FaLocationPin />

import "../../../css/Common.css";

import { initMap, setArcheryPlace, movePanTo } from "../../../utils/map";

const ArcheryPlace = () => {
  // const [keyword, setKeyword] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  // const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidoList, setSidoList] = useState([]);
  const [sggList, setSggList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [archeryList, setArcheryList] = useState([]);

  useEffect(() => {
    const map = initMap("map");
    if (!map) return;

    // 시도 불러오기
    getSidoList();
  }, []);

  // 검색
  const searchSubmit = async (e) => {
    e.preventDefault();
    // searchPlaces();
    var sidoCd = document.getElementById("sidoCd").value;
    var sggCd = document.getElementById("sggCd").value;
    var state = document.getElementById("state").value;
    sggCd = sggCd.substr(0, 4);

    if (sidoCd === "") {
      alert("시도를 선택해주세요");
      return;
    }
    // 검색 결과
    try {
      const res = await axios.get("/api/user/getArcheryList", {
        params: { sidoCd, sggCd, state },
      });
      if (res.data.success) {
        console.log(res.data.result);
        setArcheryList(res.data.result);
        setArcheryPlace(res.data.result); // map.js
      }
    } catch (err) {
      console.error("회원 정보 불러오기 실패:", err);
    }
  };

  // 검색 창 보여주기
  const openMenuWrap = () => setMenuVisible(true);
  const closeMenuWrap = () => setMenuVisible(false);

  // const toggleLeftPanel = () => {
  //   setIsCollapsed((prev) => !prev);
  // };

  const getSidoList = async () => {
    try {
      const res = await axios.get("/api/user/getSidoList", {});
      if (res.data.success) {
        setSidoList(res.data.result);
      }
    } catch (err) {
      console.error("시도 정보 불러오기 실패:", err);
    }
  };

  const selectSido = async (e) => {
    try {
      const res = await axios.get("/api/user/getSggList", {
        params: { sidoCode: e.target.value },
      });
      if (res.data.success) {
        setSggList(res.data.result);
      }
    } catch (err) {
      console.error("시군구 정보 불러오기 실패:", err);
    }
  };

  const selectSgg = async () => {
    var sidoCd = document.getElementById("sidoCd").value;
    var sggCd = document.getElementById("sggCd").value;

    sggCd = sggCd.substr(0, 4);

    try {
      const res = await axios.get("/api/user/getStateList", {
        params: { sidoCd: sidoCd, sggCd: sggCd },
      });
      if (res.data.success) {
        setStateList(res.data.result);
      }
    } catch (err) {
      console.error("사정 정보 불러오기 실패:", err);
    }
  };

  const movePlace = (name, juso) => {
    movePanTo(juso);
  };
  return (
    <div className="h-[calc(100vh-124px)] overflow-hidden relative bg-black">
      <div id="map" className="w-full h-full"></div>

      {!menuVisible && (
        <div className={styles["search_btn"]} onClick={openMenuWrap}>
          <GoSearch
            color="#555"
            className="absolute top-0 left-0 bottom-0 h-[35px] w-[35px] bg-white rounded-[10px]"
          />
        </div>
      )}

      {/* <div
        className={`${styles["left_area"]} ${
          isCollapsed ? styles["collapsed"] : ""
        }`}
      >
        <div className={styles["left_content"]}></div>
        <div
          className={`${styles["left_btn"]} ${
            isCollapsed ? styles["collapsed"] : ""
          }`}
          onClick={toggleLeftPanel}
        >
          {isCollapsed ? (
            <FaChevronRight color="#555" className={styles["left_icon"]} />
          ) : (
            <FaChevronLeft color="#555" className={styles["left_icon"]} />
          )}
        </div>
      </div> */}

      {menuVisible && (
        <div
          id="menu_wrap"
          className="absolute top-0 left-0 bottom-0 w-[230px] max-h-[500px] z-50 bg-white/70 p-[5px] mx-[10px] my-[20px] rounded-[10px]"
        >
          <div className="h-[25px]">
            <button
              className="absolute top-[5px] right-[10px] border-none font-[20px] font-bold cursor-pointer"
              onClick={closeMenuWrap}
            >
              x
            </button>
          </div>

          {/* <div className={styles["option"]}>
            <form onSubmit={searchSubmit}>
              <input
                type="text"
                value={keyword}
                id="keyword"
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="검색"
              />
              <button type="submit">검색</button>
            </form>
          </div> */}

          <div className="p-4 w-full flex justify-center">
            <form
              onSubmit={searchSubmit}
              className="flex flex-col items-left gap-3 w-full max-w-xs"
            >
              <select
                onChange={selectSido}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                id="sidoCd"
              >
                <option value="">시도 선택</option>
                {sidoList.map((i) => (
                  <option key={i.sido_code} value={i.sido_code}>
                    {i.sido_name}
                  </option>
                ))}
              </select>
              <select
                onChange={selectSgg}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                id="sggCd"
              >
                <option value="">시군구 선택</option>
                {sggList.map((i) => (
                  <option key={i.sgg_code} value={i.sgg_code}>
                    {i.sgg_name}
                  </option>
                ))}
              </select>
              <select
                id="state"
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">사정 선택</option>
                {stateList.map((i) => (
                  <option key={i.archery_name} value={i.archery_name}>
                    {i.archery_name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-orange-300 text-white font-bold text-md lg:text-base rounded-[5px] hover:bg-orange-400"
              >
                검색
              </button>
            </form>
          </div>
          <hr />
          <div className="p-[10px] max-h-[250px] overflow-y-auto custom-scrollbar">
            {archeryList.map((i) => (
              <div key={i.rownum} className="mt-[10px]">
                <div className="flex items-center mb-[6px]">
                  <div className="relative w-[26px] h-[26px] mr-[5px] ">
                    <FaLocationPin className="w-full h-full text-red-500" />
                    <span className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-[58%] text-white text-[17px] font-bold pointer-events-none">
                      {i.rownum}
                    </span>
                  </div>
                  <strong
                    className="font-bold text-[16px] pb-[3px] text-black-200 cursor-pointer"
                    onClick={() => movePlace(i.archery_name, i.juso)}
                  >
                    {i.archery_name}
                  </strong>
                </div>
                <p className="text-[14px] text-gray-900 mx-[4px]">{i.juso}</p>
                <p className="text-[14px] text-gray-900 mx-[2px]">
                  과녁 수 : {i.target_count ? i.target_count : "-"}
                </p>
                <p className="text-[14px] text-gray-900 mx-[2px]">
                  방향 : {i.direction ? i.direction : "-"}
                </p>
              </div>
            ))}
          </div>

          {/* <ul className={styles["placesList"]} id="placesList"></ul> */}
          {/* <div className={styles["pagination"]} id="pagination"></div> */}
        </div>
      )}
    </div>
  );
};

export default ArcheryPlace;
