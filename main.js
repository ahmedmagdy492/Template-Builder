let scope = document.querySelector('#builder-page-container');

//const editElements = scope.querySelectorAll('.builder-edit');
//const sections = scope.querySelectorAll('.builder-section');
//const sectionContainers = scope.querySelectorAll('.builder-section-container');

// modal references
const addSectionModal = scope.querySelector('#builder-add-section-modal');

const states = [];
const maxStates = 5;

function saveState()
{
    if(states.length < 5)
    {
        states.push(scope.cloneNode(true));
    }
    else {
        states.shift();
        states.push(scope.cloneNode(true));
    }
}

function undo()
{
    if(states.length > 0)
    {
        let lastState = states.pop();
        scope.remove();
        scope = lastState;
        setupEditElements();
        document.body.appendChild(scope);
    }
}

function handleInputsSave(event, builderEditEl, inputEl)
{
    if(event.key === 'Enter')
    {
        // we need to save the state of the input into the element
        if(!inputEl.value)
        {
            builderEditEl.remove();
        }
        else {
            builderEditEl.children[0].style.display = 'block';
            builderEditEl.children[1].style.display = 'none';
            builderEditEl.children[0].innerText = inputEl.value;
        }
        saveState();
    }
    else if(event.key === 'Escape')
    {
        builderEditEl.children[0].style.display = 'block';
        builderEditEl.children[1].style.display = 'none';
    }
}

function editInput(builderEditEl) {
    // give the user the ability to modify that element content
    builderEditEl.children[0].style.display = 'none';
    builderEditEl.children[1].style.display = 'block';
    builderEditEl.children[1].select();
    builderEditEl.children[1].focus();
}


function setupEditElements()
{
    const editElements = scope.querySelectorAll('.builder-edit');
    [...editElements].forEach(i => {
        i.style.cursor = 'pointer' ;

        let actualEl = i.children[0];
        let input = document.createElement('input');
        input.type = 'text';
        input.value = actualEl.innerText;
        input.style.display = 'none';
        input.onkeydown = function(e)
        {
            handleInputsSave(e, i, input);
        }
        i.appendChild(input);

        i.addEventListener('dblclick', function() {
            editInput(i);
        })
     });
}

function addNewInput()
{
    const inputContainer = document.querySelector('#input-container');

    let mainDiv = document.createElement('div');
    mainDiv.style.marginTop = '10px';
    let label = document.createElement('label');
    label.className = 'control-label';
    label.innerText = 'Input Field';
    let input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control builder-add-section-input';
    let remove = document.createElement('div');
    remove.className = 'btn btn-danger';
    remove.innerText = "Remove Input";
    remove.onclick = function(e) {
        e.target.parentElement.remove();
    }
    mainDiv.appendChild(label);
    mainDiv.appendChild(input);
    mainDiv.appendChild(remove);
    inputContainer.appendChild(mainDiv);
}

function injectModal(sectionID)
{
    return `
        <div class="modal fade" id="builder-add-section-modal" tabindex="-1">
        <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title">Add New Section</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
            <div id="input-container">
                <div>
                    <label class="control-label">Section Title</label>
                    <input type="text" class="form-control builder-add-section-input" />
                </div>

                <div>
                    <label class="control-label">Input Field</label>
                    <input type="text" class="form-control builder-add-section-input" />
                </div>
            </div>

            <div class="mt-2">
                <button class="btn btn-primary" onclick="addNewInput()">Add New Input</button>
            </div>
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="addSection('${sectionID}')">Add Section</button>
            </div>
        </div>
        </div>
    </div>`;
}

function setupSections()
{
    const sections = scope.querySelectorAll('.builder-section');
    const sectionContainers = scope.querySelectorAll('.builder-section-container');

    [...sections].forEach(sec => {
        sec.style.position = 'relative';
        let removeBtn = document.createElement('div');
        removeBtn.innerText = 'x';
        removeBtn.style.color = "#888";
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.fontWeight = '900';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '5px';
        removeBtn.style.right = '5px';
        removeBtn.title = 'remove current section';
        removeBtn.onclick = function() {
            sec.remove();
        }
        sec.appendChild(removeBtn);
    });

    [...sectionContainers].forEach((secCont, i) => {
        let addSectionItems = [...secCont.children].filter(i => i.innerText.toLowerCase().includes('add section'));
        if(addSectionItems.length == 0)
        {
            const addBtn = document.createElement('button');
            addBtn.className = 'btn btn-dark my-2 w-100 mx-2';
            addBtn.innerText = 'Add Section';
            secCont.id = `section-container-${i}`;

            addBtn.onclick = function() {
                const modalContainer = document.querySelector('.builder-modal-containers');
                modalContainer.innerHTML = injectModal(`section-container-${i}`);
                const builderAddSectionModal = new bootstrap.Modal('#builder-add-section-modal');
                builderAddSectionModal.show();
            }
            secCont.querySelector('#actions').appendChild(addBtn);
        }
    });
}

function addSection(sectionID)
{
    const inputs = [...document.querySelectorAll('.builder-add-section-input')];
    const containerSection = document.querySelector(`#${sectionID}`);
    let parentDiv = document.createElement('div');
    parentDiv.className = 'builder-section';
    containerSection.appendChild(parentDiv);

    for(let i = 0; i < inputs.length; i++)
    {
        if(i == 0)
        {
            // title element
            let div = document.createElement('div');
            div.style = 'margin-left: 50px; position: relative;';
            div.className = 'builder-edit theme-fg title';
            let h2 = document.createElement('h2');
            h2.innerText = inputs[i].value;
            h2.style.fontWeight = 'bold';
            div.appendChild(h2);
            parentDiv.appendChild(div);
        }
        else {
            let div = document.createElement('div');
            div.style = 'margin-left: 50px; position: relative;';
            div.className = 'builder-edit';
            let innerDiv = document.createElement('div');
            innerDiv.innerText = inputs[i].value;
            div.appendChild(innerDiv);
            parentDiv.appendChild(div);
        }
    }

    setupSections();
    setupEditElements();
}

window.addEventListener('keydown', function(e) {
    if(e.ctrlKey && e.key === 'z')
    {
        //undo();
    }
})

window.addEventListener('load', function() {
    // all processing should happen here
    setupSections();

    setupEditElements();

    saveState();
});