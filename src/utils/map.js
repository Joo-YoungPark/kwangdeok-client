let sdkLoaded = false;

export async function loadKakaoSdk() {
  if (sdkLoaded) return;

   return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      sdkLoaded = true;
      return resolve();
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAOMAP_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          sdkLoaded = true;
          console.log("✅ Kakao SDK 로드 완료");
          resolve();
        });
      } else {
        console.error("❌ window.kakao.maps 객체 접근 실패");
        reject("❌ SDK 로딩 실패 (window.kakao.maps 없음)");
      }
    };
    script.onerror = (e) => {
      console.error("❌ SDK 로드 에러", e);
      reject("❌ Kakao SDK 로드 실패");
    };
    document.head.appendChild(script);
  });
}
var map = '';
var markers = [];


export async function initMap(containerId, center = { lat: 36.533762, lng: 128.005222 }, level = 13) {
  await loadKakaoSdk();

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`ID가 '${containerId}'인 요소를 찾을 수 없습니다.`);
    return;
  }

  const options = {
    center: new window.kakao.maps.LatLng(center.lat, center.lng),
    level,
  };

  map = new window.kakao.maps.Map(container, options);

  // 지도 타입 컨트롤
  const mapTypeControl = new window.kakao.maps.MapTypeControl();
  map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

  // 확대/축소 컨트롤
  // const zoomControl = new window.kakao.maps.ZoomControl();
  // map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);


  return map;
}


export async function setArcheryPlace(list) {
  await loadKakaoSdk();

  if (!Array.isArray(list) || list.length === 0) {
    console.warn("마커로 표시할 장소가 없습니다.");
    return;
  }

  const geocoder = new window.kakao.maps.services.Geocoder();
  const bounds = new window.kakao.maps.LatLngBounds();
  const coordsList = [];

  markers.forEach((m) => m.setMap(null));
  markers = [];

  let geocodedCount = 0;

  list.forEach((place) => {
    if (!place.juso || !place.archery_name) return;

    geocoder.addressSearch(place.juso, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        coordsList.push({ place, coords });
        bounds.extend(coords);
      } else {
        console.warn(`주소 변환 실패: ${place.juso}`);
      }

      geocodedCount++;
      if (geocodedCount === list.length) {
        renderMarkers(coordsList); // 모든 좌표 변환 후 마커 렌더링
        if (!bounds.isEmpty()) map.setBounds(bounds);
      }
    });
  });

  // 줌 변경 시 마커 다시 그림
  window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
    renderMarkers(coordsList);
  });
}

function renderMarkers(dataList) {
  // 기존 마커 제거
  markers.forEach((m) => m.setMap(null));
  markers = [];

  const level = map.getLevel();
  let scaleName = "";

  if (level <= 13 && level >= 11) {
    scaleName = "kakao-marker-small";
  } else if (level <= 10 && level >= 8) {
    scaleName = "kakao-marker-medium";
  } else if (level <= 7 && level >= 0) {
    scaleName = "kakao-marker-large";
  }else {
    scaleName = "kakao-marker-none"
  }

  dataList.forEach(({ place, coords }) => {
    const markerContainer = document.createElement("div");
    markerContainer.className = scaleName;
    markerContainer.innerHTML = `
      <div class="kakao-marker-pin">
        <div class="kakao-marker-number">${place.rownum}</div>
      </div>
      <div class="kakao-marker-label">${place.archery_name}</div>
    `;

    const overlay = new window.kakao.maps.CustomOverlay({
      content: markerContainer,
      position: coords,
      yAnchor: -0.6,
    });

    overlay.setMap(map);
    markers.push(overlay);

    const pinElement = markerContainer.querySelector(".kakao-marker-pin");
    const labelElement = markerContainer.querySelector(".kakao-marker-label");

    let currentInfoOverlay = null;

    if (pinElement) {
      pinElement.addEventListener("click", (e) => {
        e.stopPropagation();
        movePanTo(`${place.juso}`)

        if (currentInfoOverlay) {
          currentInfoOverlay.setMap(null);
          currentInfoOverlay = null;
        }

        const infoContainer = document.createElement("div");
        infoContainer.className = "info_container";
        infoContainer.innerHTML = `
        <div class="infoName">${place.juso}</div>
        <div class="infoDetail"><span>과녁 수 : </span>${place.target_count ? place.target_count : "-"}</div>
        <div class="infoDetail"><span>방향 : </span>${place.direction ? place.direction : "-"}</div>
        `;
       
        const info = new window.kakao.maps.CustomOverlay({
          content: infoContainer,
          position: coords,
          yAnchor: 1.6,
        });
        info.setMap(map);
        currentInfoOverlay = info;

        window.kakao.maps.event.addListener(map, 'dragend', function() {   
          info.setMap(null);    
        });
      });
    }

    if (labelElement) {
      labelElement.addEventListener("click", (e) => {
        e.stopPropagation();
        movePanTo(`${place.juso}`)
      });
    }
  });
}

export async function movePanTo(juso) {
    await loadKakaoSdk();
    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(juso, function(result, status){
        if (status === window.kakao.maps.services.Status.OK) {
        
            var coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

            map.setLevel(1)
            map.setCenter(coords);     
        }
    })
}

export async function moveToMyPosition(lat, long) {
    await loadKakaoSdk();
    var moveLatLon = new window.kakao.maps.LatLng(lat, long);
    map.setLevel(3)
    map.setCenter(moveLatLon);

    const markerContainer = document.createElement("div");
    markerContainer.className = "myLocation";
    markerContainer.innerHTML = `
    `;

    const overlay = new window.kakao.maps.CustomOverlay({
      content: markerContainer,
      position: moveLatLon,
      yAnchor: -0.6,
    });

    overlay.setMap(map);

    window.kakao.maps.event.addListener(map, 'dragend', function() {   
      overlay.setMap(null);    
    });
}

