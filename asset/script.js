// script.js (전체 페이지 공통 - All 상태 로딩 시 토스트 미표시 버전)

window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(async function(OneSignal) {
  await OneSignal.init({
    appId: "b6867d37-a324-4ad0-844e-4597ecfcaa31",
  });
});


function openNav() {
  const myNav = document.getElementById("myNav");
  myNav.classList.add("open"); 
}

function closeNav() {
  const myNav = document.getElementById("myNav");
  myNav.classList.remove("open"); 
}
// index.html의 기존 <script> 태그 내에 추가
function saveFilterAndNavigate(filterTag) {
    // 단일 필터도 배열 형태로 저장
    localStorage.setItem('initialFilters', JSON.stringify([filterTag])); 
    location.href = 'list.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.getElementById('filterButtons');
    // filterButtons이 없으면 실행하지 않음 (list/list-blog 페이지에서만 실행)
    if (!filterButtons) return; 
    
    // 👇 수정: 두 리스트 ID를 모두 선택하여 재활용 가능하게 함
    const items = document.querySelectorAll('#itemList .item, #itemListBlog .item');
    if (items.length === 0) return; // 아이템이 없으면 종료
    
    // 👇 토스트 요소 가져오기
    const reorderingToast = document.getElementById('reorderingToast'); 

    let activeFilters = new Set(); // 현재 활성화된 필터 태그 (Set)

    // **👇 1. 초기 필터 값 가져오기**
    const storedFiltersJson = localStorage.getItem('initialFilters');
    let initialFilters = [];
    if (storedFiltersJson) {
        try {
            initialFilters = JSON.parse(storedFiltersJson);
            // 저장된 필터 값을 사용했으므로 바로 삭제
            localStorage.removeItem('initialFilters'); 
        } catch (e) {
            console.error("Failed to parse initial filters:", e);
        }
    }

    
    // 필터링 함수 (선택된 태그 중 '하나라도' 포함하는 아이템을 표시하는 OR 조건)
    const applyFilters = () => {
        const filtersArray = Array.from(activeFilters);
        const transitionDuration = 300; // CSS의 transition: 0.3s와 동일하게 설정 (밀리초)

        // 👇 핵심 수정: 'all' 필터가 활성화되어 있지 않을 때만 토스트 표시/숨김을 처리합니다.
        const shouldShowToast = !activeFilters.has('all');

        // 1. 필터링 시작 시 토스트 표시 (All이 아닐 때만)
        if (reorderingToast && shouldShowToast) { 
            reorderingToast.classList.add('visible');
        }
        
        let totalItems = items.length;
        let processedCount = 0;

        items.forEach(item => {
            let shouldHide = false;
            
            // 1. 숨김 여부 결정
            // 'all' 필터가 활성화되어 있거나, 활성화된 필터가 없으면 모두 표시 (숨기지 않음)
            if (!activeFilters.has('all') && activeFilters.size !== 0) {
                
                // 선택된 태그 중 하나라도 아이템 클래스에 포함되어 있는지 확인합니다.
                const matchesAnyFilter = filtersArray.some(filterTag => {
                    return item.classList.contains(filterTag);
                });
                
                // matchesAnyFilter가 false이면 (아무것도 포함하지 않으면) 숨깁니다.
                if (!matchesAnyFilter) {
                    shouldHide = true;
                }
            }
                
            // 2. 숨김 처리 (Fade Out + Display None)
            if (shouldHide) {
                item.classList.add('hidden');
                setTimeout(() => {
                    if (item.classList.contains('hidden')) {
                         item.style.display = 'none'; // 영역 완전히 제거
                    }
                    processedCount++;
                    checkIfDone(); // 처리 완료 확인
                }, transitionDuration); 
                
            } 
            
            // 3. 보이기 처리 (Display Block/Flex + Fade In)
            else {
                // 리스트 아이템에 적합한 display 속성으로 설정
                item.style.display = 'block'; 
                
                // display를 설정한 후 잠시 기다렸다가 hidden을 제거해야 transition이 작동합니다.
                setTimeout(() => {
                    item.classList.remove('hidden'); 
                    processedCount++;
                    checkIfDone(); // 처리 완료 확인
                }, 10); 
            }
        });

        // 모든 아이템의 처리(애니메이션)가 완료되었는지 확인하고 토스트 숨김
        const checkIfDone = () => {
            if (processedCount === totalItems) {
                 // 모든 아이템의 애니메이션 처리가 완료된 후 토스트 숨김 (All 상태가 아닐 때만)
                setTimeout(() => {
                    if (reorderingToast && shouldShowToast) {
                        reorderingToast.classList.remove('visible');
                    }
                }, transitionDuration); // 가장 긴 transition 시간에 맞춰 기다립니다.
            }
        }
        
        // 아이템이 0개인 경우 대비
        if (totalItems === 0) {
            checkIfDone();
        }
    };
    

    // **👇 2. 초기 필터 적용 로직**
    const initializeFilters = () => {
        const allButton = document.querySelector('[data-filter="all"]');
        
        // 1. 초기화: 모든 버튼 비활성화
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        activeFilters.clear();
        
        if (initialFilters.length > 0 && initialFilters[0] !== 'all') {
            // 넘어온 필터가 있을 경우 활성화
            initialFilters.forEach(filterTag => {
                activeFilters.add(filterTag);
                const targetButton = document.querySelector(`[data-filter="${filterTag}"]`);
                if (targetButton) {
                    targetButton.classList.add('active'); // 해당하는 버튼 활성화
                }
            });
            
        } else {
            // 기본 'All' 상태 적용
            activeFilters.add('all');
            if (allButton) {
                allButton.classList.add('active');
            }
        }
        
        // 필터링 적용 (초기 로드 시)
        applyFilters();
    };
    
    initializeFilters();


    // 버튼 클릭 이벤트 리스너 (멀티 선택 토글 로직)
    filterButtons.addEventListener('click', (e) => {
        const button = e.target.closest('.filter-btn');
        if (!button) return;

        const filterTag = button.dataset.filter;
        
        if (filterTag === 'all') {
            // 'All' 클릭 시: 모든 필터 해제 후 'all'만 활성화
            activeFilters.clear();
            activeFilters.add('all');
            
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

        } else {
            // 특정 태그 클릭 시: 
            
            // 1. 'all'이 활성화되어 있으면 해제
            if (activeFilters.has('all')) {
                activeFilters.delete('all');
                document.querySelector('[data-filter="all"]').classList.remove('active');
            }
            
            // 2. 현재 태그 토글
            if (activeFilters.has(filterTag)) {
                activeFilters.delete(filterTag);
                button.classList.remove('active');
            } else {
                activeFilters.add(filterTag);
                button.classList.add('active');
            }
        }
        
        // 3. 만약 필터가 모두 해제되면 'All'을 강제로 활성화
        if (activeFilters.size === 0) {
            activeFilters.add('all');
            document.querySelector('[data-filter="all"]').classList.add('active');
        }

        applyFilters();
    });

});