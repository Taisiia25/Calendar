
class RenderTimeLine{
    constructor() {
        this.container = document.querySelector('.calendar');
        this.renderTimeLine();
    }

    renderTime(time) {
        const hourContainer = document.createElement('div');
        hourContainer.className = 'one-hour-container';

        if  (time < 17) { 
            hourContainer.innerHTML = ` 
            <h3 class="time-box">${time}:00</h3>
            <h4 class="time-box harf-an-hour">${time}:30</h4>
            `;
        } else {
            hourContainer.innerHTML = ` 
            <h3 class="time-box">${time}:00</h3>
            `;
        }
        this.container.append(hourContainer);
    }

    renderTimeLine() {
        for (let i = 8; i <= 17; i++) {
            this.renderTime(i);
        }
    }
}

// одна подія
class Event {
    constructor(element){
        // передаємо властивості об'єкту taskList
        Object.assign(this, element);
        this.width = 200;
        this.end = element.start + element.duration;
        this.leftX = 50;

        // старт івенту
        this.startHoursEvent = (element.start - this.startMinutesEvent)/60 + 8;
        this.startMinutesEvent = element.start % 60;
    }

}

// масив подій
class EventList {
    constructor(array) {
        this.taskList = array;
        // масив інстансів 

        // кожен елемент масиву (array) наділено властивостями класу Event
        this.eventInstanceArray = this.taskList
            .sort((a, b) => a.start - b.start)
            .map(element => new Event(element));
        this.setUpEventWidth();
    }
    get getTaskList() {
        console.log('getter', this.taskList)
        return this.taskList;
    }
    setUpEventWidth() {
        const array = this.eventInstanceArray; 
        for (let i = 0; i < array.length - 1;  i++) {
            for (let j = 0; j < array.length; j++) {
                if (array[i].end > array[j].start && array[i].start < array[j].start || 
                    array[i].end > array[j].start && array[i].end < array[j].end) {

                        array[i].width = 100;
                        array[j].width = 100;

                        if (array[i].leftX === array[j].leftX) {
                            array[j].leftX += 100;
                        }

                        if (array[i].leftX === 150 && array[j].leftX == 50) {
                            array[j].leftX += 200;
                        }
                    }
            }
        }
    }

}

class RenderEventList {
    #timeLine = null;
    constructor(eventArray, timeLine) {
        // eventArray є об'єктом інстансу eventList (масиву  подій)
        this.container = document.querySelector('.calendar');
        this.eventArray = eventArray.taskList;
        this.#timeLine = timeLine;
        this.taskList = eventArray.taskList;
        this.renderEventList(eventArray.eventInstanceArray);

        this.eventList = eventArray;
    }
    // передаем taskList
    get getEventArray() {
        return this.eventArray;
    }

    renderOneEvent(event) {
        const eventContainer = document.createElement("div");
        eventContainer.className = "event-block";
        eventContainer.innerHTML = `
            <p>${event.title}</p>
        `;
        eventContainer.addEventListener ('click', () => {
            this.openModal(event);
        });

        eventContainer.setAttribute("style", 
            `height: ${event.duration * 2}px; 
            width: ${event.width}px; 
            top: ${event.start * 2}px; 
            left: ${event.leftX}px; 
            background: #E2ECF580; 
            border-left: 3px solid #6e9fcf80;
        `);
        
        return eventContainer;
    }
    // рендер масива в DOM
    renderEventList(array) {
        this.taskList = array;
        //  очистити попередні івенти
        this.container.innerHTML = '';
        this.#timeLine.renderTimeLine();
        
        let arrayCollection = array.map(item => this.renderOneEvent(item));
        this.container.append(...arrayCollection);
    }
    openModal(event) {
        new EditModal(this, this.eventList, event);
    }
}

class AddEvent {
    #eventList = null;
    constructor(renderEventList, eventList) {
        this.addButton = document.querySelector('.add-event-button');

        this.eventList = eventList;
        this.eventArray = renderEventList.getEventArray;
        this.renderEventList = renderEventList
        this.openModal();
    }
    openModal() {
        this.addButton.addEventListener ('click', () => {
            new EventModalForm(this.renderEventList, this.eventList);
        })
    }
}

class EventModalForm {
    #eventList = null;
    constructor(renderEventList, eventList) {
        this.modalContainer = document.querySelector('.modal');
        
        this.btnAddEvent = document.querySelector('.input-btn-add');
        this.btnShow = document.querySelector('.open-inputs-btn');
        this.btnClose = document.querySelector('.input-btn-close');
        this.inputContainer = document.querySelector('.inputs-container');
        this.startInput = document.getElementById('start-event');
        this.durationInput = document.getElementById('duration-event');
        this.titleInput = document.getElementById('title-event');

        this.eventArray = renderEventList.getEventArray;
        this.renderEventList = renderEventList
        this.openModal();
        this.closeOusideModal();
        this.closeButtonFunctionality();
        this.addEventButtonFunctionality();
    }

    openModal() {
        this.modalContainer.classList.add('modal_active');
    }
    closeModal() {
        this.modalContainer.classList.remove('modal_active');
    }
    closeOusideModal() {
        this.modalContainer.addEventListener("click", (event) => {
            const isClickInsideModal = document.querySelector(".modal_active .innerModal").contains(event.target)
            if (!isClickInsideModal) {
               this.closeModal();
            }
        });
    }
    
    closeButtonFunctionality() {
        this.btnClose.addEventListener ('click', () => {
            this.closeModal();
        })
    }

    addEventButtonFunctionality() {
        this.btnAddEvent.addEventListener ('click', () => {
            const start = this.formatStartValue(this.startInput.value);
            const title = this.titleInput.value;
            const duration = this.durationInput.value;
            const newEvent = { start, title, duration };
            const updetedEventArray = [...this.eventArray, newEvent];
            const formatedEventArray = new EventList(updetedEventArray);
            this.renderEventList.renderEventList(formatedEventArray.eventInstanceArray);
            this.closeModal();
        });
    }

    formatStartValue(value) {
        if(!value) return '';
        const [hours, minutes] = value.split(':');
        const startTimeInMinutes = (Number(hours) - 8) * 60 + Number(minutes);

        return startTimeInMinutes;
    }
}

class EditModal extends EventModalForm {
    constructor(renderEventList, eventList, event) {
        super(renderEventList, eventList)
        this.event = event;
        this.setUpModal(event);
        this.deleteEvent();
        this.editEvent();
    }
    
    setUpModal(event) {
        this.modalContainer.classList.add('edit-modal');
        this.startInput.value  = this.getStartTime(event);
        this.durationInput.value = event.duration;
        this.titleInput.value = event.title;

    }
    getStartTime() {
        const hourDuration = Math.floor(this.event.start / 60)
        const hours = `${8 + hourDuration}`.padStart(2, "0");
        const  minutes = `${this.event.start - (hourDuration * 60)}`.padStart(2, "0");
        return `${hours}:${minutes}`
    }
    closeEditModal() {
        //використовуємо метод з батьківського класу
        
        this.modalContainer.classList.remove('edit-modal');
        super.closeModal();
    }
    closeOusideModal() {
        this.modalContainer.addEventListener("click", (event) => {
            const innerModal = document.querySelector(".modal_active .innerModal");
            if(innerModal) {
                const isClickInsideModal = innerModal.contains(event.target);
                if (!isClickInsideModal) {
                   this.closeEditModal();
                }
            }
        });
    }
    
    closeButtonFunctionality() {
        this.btnClose.addEventListener ('click', () => {
            this.closeEditModal();
        })
    }
    deleteEvent(){
        const deleteBtn = document.querySelector('.btn-remove');
        deleteBtn.addEventListener ('click', (event) =>  {
            const updetedEventArray = this.eventArray.filter(item => item.id !== this.event.id);
            const formatedEventArray = new EventList(updetedEventArray);
            this.renderEventList.renderEventList(formatedEventArray.eventInstanceArray);
            this.closeEditModal();
        
        });
    }
    editEvent() {
        const editBtn = document.querySelector('.input-btn-edit');
        editBtn.addEventListener ('click', (event) =>  {
            const start = this.formatStartValue(this.startInput.value);
            const title = this.titleInput.value;
            const duration = this.durationInput.value;
            const newEvent = { start, title, duration };
            const updetedEventArray = this.eventArray.map(item => item.id === this.event.id ? newEvent : item);
            const formatedEventArray = new EventList(updetedEventArray);
            this.renderEventList.renderEventList(formatedEventArray.eventInstanceArray);
            this.closeEditModal();
        });
    }
}

const renderTimeLine = new RenderTimeLine();
const eventList = new EventList(taskList.map((element, index) => {
    return {
        ...element,
        id: index,
    }
}));
const renderEventList = new RenderEventList(eventList, renderTimeLine);
const addEvent = new AddEvent(renderEventList, eventList);
