//전역변수
const checkboxList = document.querySelectorAll(
  '.filter-container__check-item>input[type=checkbox]'
);
const fullContainer = document.querySelector('.full-container');
const modalContainer = document.querySelector('.modal-container');

let projectsArray = [];

//프로젝트 데이터 받아오기
async function loadProjects() {
  projectsArray = [];

  try {
    const response = await fetch('./projects.json');
    const data = await response.json();
    projectsArray = [...data];
  } catch (err) {
    alert(`에러 : ${err}`);
  }

  //로딩중일 땐 메세지 띄우기
  createLoadingMessage();
  //로딩 완료되면 카드 만들고 로딩 완료 메세지로 바꾼 후 없애기
  if (projectsArray.length > 0) {
    filterProjects();
    removeLoadingMessage();
  }
}

//로딩 메세지 생성
function createLoadingMessage() {
  let template = `<p class="loading-message">포트폴리오 로딩중입니다...</p>`;
  document.body.insertAdjacentHTML('beforeend', template);
}

//로딩 완료 메세지 없애기
function removeLoadingMessage() {
  const loadingMessage = document.querySelector('.loading-message');
  setTimeout(() => {
    loadingMessage.textContent = '포트폴리오 로딩이 완료되었습니다.';
    setTimeout(() => {
      loadingMessage.remove();
    }, 500);
  }, 50);
}

//필터링 후 카드 생성
function filterProjects() {
  const skillCheckboxList = document.querySelectorAll(
    '.filter-container__left input[type=checkbox]'
  );
  const optionCheckboxList = document.querySelectorAll(
    '.filter-container__right input[type=checkbox]'
  );
  const optionCheckValueArray = [];
  const skillCheckValueArray = [];

  let filterArray = [...projectsArray];

  //모든 체크박스의 id륿 배열에 담음
  [...optionCheckboxList].forEach((a) => {
    if (a.disabled === false && a.checked) {
      optionCheckValueArray.push(a.id);
    }
  });
  [...skillCheckboxList].forEach((a) => {
    if (a.checked) {
      skillCheckValueArray.push(a.id);
    }
  });

  //필터링
  for (let value of optionCheckValueArray) {
    if (value === 'key-projects') {
      filterArray = filterArray.filter(
        (project) => project.isKeyProject === true
      );
    } else if (value === 'all-projects') {
      filterArray = [...projectsArray];
    }

    if (value === 'responsive') {
      filterArray = filterArray.filter(
        (project) => project.isResponsive === true
      );
    }
  }

  for (let value of skillCheckValueArray) {
    filterArray = filterArray.filter(
      (project) => project.skills.some((skill) => skill === value) === true
    );
  }

  createProjectCard(filterArray);
}

//카드 생성해주는 함수
function createProjectCard(arr) {
  const nullMessage = document.querySelector(
    '.project-container__null-message '
  );
  const projectList = document.querySelector('.project-container__list');

  [...projectList.children].forEach((a) => a.remove());

  if (arr.length > 0) {
    let template = '';
    nullMessage.style.display = 'none';

    arr.forEach((a) => {
      const workers = a.workers > 1 ? 'Team' : 'Single';
      template += ` <li class="project-container__item" >
              <div class="project-card">
                <a href="#" data-id=${a.id} >
                  <div class="project-card__thumb-wrap">
                    <img
                      class="project-card__thumb"
                      src=${a.img}
                      alt=${a.title}
                    />
                  </div>
                  <div class="project-card__txt-wrap">
                    <h3 class="project-card__tit">${a.title}</h3>
                    <span class="project-card__badge ${workers}">${workers}</span>
                  </div>
                </a>
              </div>
            </li>`;
    });

    projectList.insertAdjacentHTML('beforeend', template);

    //이벤트 리스너 달기(모달창 열기)
    const openModal = (projectId) => {
      modalContainer.classList.add('--open');
      fullContainer.classList.add('--no-scroll');
      modalContentFill(projectId);
    };

    document.querySelectorAll('.project-card>a').forEach((a) => {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(this.dataset.id);
      });
    });
  } else {
    nullMessage.style.display = 'block'; //일치하는 결과가 없을 때 띄우는 메세지
  }
}

//모달창 내용 채우기
function modalContentFill(projectId) {
  const modalContent = document.querySelector('.modal-content');

  const findProject = projectsArray.find(
    (project) => parseInt(projectId) == project.id
  );

  let template = `<button type="button" class="modal-content__close-btn">
            <div></div>
          </button>
          <div class="modal-content__img-wrap">
            <img src=${findProject.fullImg} alt=${findProject.title} />
          </div>
          <div class="modal-content__txt-wrap">
            <h3 class="modal-content__tit">${findProject.title}</h3>
            <ul class="modal-content__info-list">
              <li class="modal-content__info-item ">제작 인원 : ${
                findProject.workers
              }</li>
              <li class="modal-content__info-item ">제작 기간 : ${
                findProject.period
              }</li>
              <li class="modal-content__info-item ">
                사용 기술 : ${findProject.skills.join(', ')}
              </li>
              <li class="modal-content__info-item ">
                반응형 : ${findProject.isResponsive ? 'O' : 'X'}
              </li>
            </ul>

            <p class="modal-content__desc">
              ${findProject.desc}
            </p>
            <div class="modal-content__links">
              <a href=${
                findProject.githubLink
              } target="_blank">Github 바로가기</a>
              <a href=${
                findProject.siteLink
              } target="_blank">사이트 바로가기</a>
            </div>`;

  [...modalContent.children].forEach((a) => a.remove());
  modalContent.insertAdjacentHTML('beforeend', template);

  //이벤트 리스너 달기 (모달창 닫기)
  const modalClose = (e) => {
    const modalCloseButton = document.querySelector(
      '.modal-content__close-btn'
    );

    if (e.target === modalCloseButton || e.target === modalContainer) {
      modalContainer.classList.remove('--open');
      fullContainer.classList.remove('--no-scroll');
    }
  };

  modalContainer.addEventListener('click', modalClose);
}

//체크박스 클릭했을 때 실행될 함수
checkboxList.forEach((checkbox) => {
  checkbox.addEventListener('change', checkBoxChangeFunction);
});

function checkBoxChangeFunction(e) {
  const allProjects = document.getElementById('all-projects');
  const keyProjects = document.getElementById('key-projects');

  if (e.target.id === 'all-projects') {
    keyProjects.checked = false;
    allProjects.checked = true;
  } else if (e.target.id === 'key-projects') {
    allProjects.checked = false;
    keyProjects.checked = true;
  }

  filterProjects();
}

//함수 실행
loadProjects();
