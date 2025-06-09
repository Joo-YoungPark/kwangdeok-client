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


export async function initMap(containerId, center = { lat: 37.326509, lng: 126.817503 }, level = 7) {
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
  const zoomControl = new window.kakao.maps.ZoomControl();
  map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);


  return map;
}

export async function setArcheryPlace(list) {

  await loadKakaoSdk();

  if (!Array.isArray(list) || list.length === 0) {
    console.warn("마커로 표시할 장소가 없습니다.");
    return;
  }

  markers.forEach((m) => m.setMap(null));
  markers = [];

  const geocoder = new window.kakao.maps.services.Geocoder();
  const bounds = new window.kakao.maps.LatLngBounds();
  let geocodedCount = 0;

  list.forEach((place) => {
    if (!place.juso || !place.archery_name) return;

    geocoder.addressSearch(place.juso, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

        const markerContainer = document.createElement("div");
        markerContainer.className = "kakao-marker";
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

        window.kakao.maps.event.addListener(map, 'zoom_changed', function () {
            const level = map.getLevel();
            const labels = document.querySelectorAll(".kakao-marker-label");

            labels.forEach(label => {
                label.style.display = level >= 9 ? "none" : "inline-block";
            });
        });

        markers.push(overlay);
        bounds.extend(coords);
    
      } else {
        console.warn(`주소 변환 실패: ${place.juso}`);
      }

      geocodedCount++;
      if (geocodedCount === list.length && !bounds.isEmpty()) {
        map.setBounds(bounds);
      }
    });
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

