document.addEventListener('DOMContentLoaded', (event) => {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const detailsCard = document.getElementById('reservation-details');
    const detailsDateSpan = document.getElementById('details-date');
    const detailsWorkshopInfo = document.getElementById('details-workshop-info');
    const detailsStayInfo = document.getElementById('details-stay-info');
    const navBackground = document.querySelector('.nav-background');
    const filosofiaSection = document.getElementById('filozofia'); 
    const hamburgerBtn = document.getElementById('menu-toggle-btn');
    const mainMenu = document.querySelector('.nav-links');
    const audio = document.getElementById('background-audio');
    const toggleLink = document.getElementById('toggle-sound-btn');

    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
    const eventData = {
        '2025-12-05': { type: 'unavailable', description: 'Konserwacja obiektu (Zajęte)' },
        '2025-12-06': { type: 'workshop', name: 'Sobota: Rytm Ciszy (Handpan)', stay: true, description: 'Intensywny warsztat grania na Handpanie, idealny na weekend.' },
        '2025-12-07': { type: 'workshop', name: 'Niedziela: Snycerstwo', stay: true, description: 'Tworzenie drewnianych łyżek i misek z naturalnego drewna.' },
        '2025-12-12': { type: 'unavailable', description: 'Urlop właścicieli (Zajęte)' },
        '2025-12-17': { type: 'workshop', name: 'Środa: Ziołolecznictwo i Ogień', stay: false, description: 'Warsztaty rozpoznawania ziół i biesiadowania przy ognisku. Nocleg niedostępny.' },
        '2026-01-10': { type: 'workshop', name: 'Sobota: Handpan', stay: true, description: 'Powtórka warsztatu Handpanu.' },
        '2026-01-11': { type: 'workshop', name: 'Niedziela: Snycerstwo', stay: false, description: 'Rzeźbienie w drewnie. Nocleg niedostępny.' }, 
        '2026-01-18': { type: 'unavailable', description: 'Wydarzenie Prywatne (Zajęte)' },
    };


    function getFormattedDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getNextDayEvent(dateString) {
        const today = new Date(dateString);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const tomorrowString = getFormattedDate(tomorrow);
        const event = eventData[tomorrowString];

        return event || null;
    }

    if (navBackground && filosofiaSection) {
        function toggleShadow() {
            const navHeight = navBackground.offsetHeight || 80; 
            const scrollThreshold = filosofiaSection.offsetTop - navHeight; 

            if (window.scrollY >= scrollThreshold) {
                navBackground.classList.add('scrolled');
            } else {
                navBackground.classList.remove('scrolled');
            }
        }
        toggleShadow();
        window.addEventListener('scroll', toggleShadow);
    }
    
    function renderCalendar(year, month) {
        if (!calendarGrid) return;
        currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        while (calendarGrid.children.length > 7) {
            calendarGrid.removeChild(calendarGrid.lastChild);
        }
        
        const startDayIndex = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
        for (let i = 0; i < startDayIndex; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day', 'empty');
            calendarGrid.appendChild(dayDiv);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = getFormattedDate(date);
            const event = eventData[dateString];
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            dayDiv.textContent = day;
            dayDiv.dataset.date = dateString;
            
            if (event) {
                if (event.type === 'unavailable') {
                    dayDiv.classList.add('unavailable');
                    dayDiv.title = event.description;
                } else if (event.type === 'workshop') {
                    dayDiv.classList.add('has-event');
                    const dayOfWeek = date.getDay(); 
                    if (event.stay && dayOfWeek !== 0) {
                        dayDiv.classList.add('has-stay'); 
                    }
                    dayDiv.title = event.name;
                }
            } 
            
            const nextEvent = getNextDayEvent(dateString);
            const dayOfWeek = date.getDay();
            
            if (!event && dayOfWeek !== 0 && nextEvent && nextEvent.type === 'workshop' && nextEvent.stay) {
                 dayDiv.classList.add('has-stay'); 
                 dayDiv.title = 'Możliwość noclegu przed warsztatem jutro.';
            }

            calendarGrid.appendChild(dayDiv);
        }
        detailsCard.style.display = 'none';
    }


    function selectDay(dayDiv) {
        const dateString = dayDiv.dataset.date;
        const event = eventData[dateString];
        const selectedDate = new Date(dateString);
        const dayOfWeek = selectedDate.getDay(); 
        
        document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
        dayDiv.classList.add('selected');
        
        detailsDateSpan.textContent = dateString;
        detailsCard.style.display = 'block';
        detailsWorkshopInfo.innerHTML = '';
        detailsStayInfo.innerHTML = '';

        let stayOption = '';
        let bookingType = '';
        let isBookingAvailable = true;
        const nextEvent = getNextDayEvent(dateString);
        
        if (event && event.type === 'workshop') {
            bookingType = 'Warsztat';
            detailsWorkshopInfo.innerHTML = `<h4>${event.name}</h4><p>${event.description}</p>`;
            
            if (event.stay) {
                if (dayOfWeek === 0) { 
                     detailsStayInfo.innerHTML += `<h5>Nocleg Niedostępny</h5><p>Noclegi nie są realizowane z Niedzieli na Poniedziałek.</p>`;
                } else {
                     stayOption = `
                         <div class="stay-option">
                             <h5>Nocleg Po Warsztacie (Gratis)</h5>
                             <label>
                                 <input type="checkbox" id="add-stay-checkbox"> 
                                 Dodaj nocleg na 1 noc (po warsztacie)
                             </label>
                         </div>`;
                }
            } else {
                detailsStayInfo.innerHTML += `<h5>Nocleg Niedostępny</h5><p>Warsztat jednodniowy, brak możliwości noclegu.</p>`;
            }
            
        } else if (event && event.type === 'unavailable') {
            detailsWorkshopInfo.innerHTML = `<h4>Termin Niedostępny</h4><p>${event.description}</p>`;
            isBookingAvailable = false;
            
        } else {
            detailsWorkshopInfo.innerHTML = `<h4>Dzień wolny od warsztatów</h4><p>Idealny na pobyt własny.</p>`;
            bookingType = 'Pobyt Własny';
            
            if (dayOfWeek === 0) {
                 detailsStayInfo.innerHTML += `<h5>Nocleg Niedostępny</h5><p>Noclegi nie są realizowane z Niedzieli na Poniedziałek.</p>`;
                
            } else if (nextEvent && nextEvent.type === 'workshop' && nextEvent.stay) {
                bookingType = 'Nocleg przed warsztatem';
                stayOption = `
                    <div class="stay-option">
                        <h5>Nocleg Przed Warsztatem (Gratis)</h5>
                        <label>
                            <input type="checkbox" id="add-stay-checkbox"> 
                            Dodaj nocleg na 1 noc (przed warsztatem)
                        </label>
                    </div>`;
            } else {
                detailsStayInfo.innerHTML += `<h5>Dostępny Pobyt Własny</h5><p>Możliwość rezerwacji pobytu. Prosimy o kontakt w celu ustalenia szczegółów pobytu.</p>`;
                bookingType = 'Pobyt Własny';
            }
        }
        
        if (isBookingAvailable) {
            detailsStayInfo.innerHTML += stayOption;
            detailsStayInfo.innerHTML += `<button id="reserve-btn" class="btn small-btn">Zarezerwuj Termin</button>`;
        }

        const reserveBtn = document.getElementById('reserve-btn');
        if (reserveBtn) {
            reserveBtn.addEventListener('click', () => {
                const addStayCheckbox = document.getElementById('add-stay-checkbox');
                const hasStay = addStayCheckbox ? addStayCheckbox.checked : false;
                
                let message = `Wysłano zapytanie o rezerwację typu: ${bookingType} dla daty ${dateString}.`;
                if (hasStay) {
                     message += ` **Zaznaczono opcję noclegu gratis.**`;
                }
                message += ` Wkrótce otrzymasz odpowiedź!`;

                alert(message);
            });
        }
    }

    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {currentMonth = 11; currentYear--;}
            renderCalendar(currentYear, currentMonth);
        });
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {currentMonth = 0; currentYear++;}
            renderCalendar(currentYear, currentMonth);
        });
    }
    if (calendarGrid) {
        calendarGrid.addEventListener('click', (e) => {
            const dayDiv = e.target.closest('.day');
            if (dayDiv && !dayDiv.classList.contains('empty') && !dayDiv.classList.contains('unavailable')) {
                selectDay(dayDiv);
            }
        });
    }
    renderCalendar(currentYear, currentMonth);
    
    const logoLink = document.getElementById('logo-top-link');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    }
    if (toggleLink && audio) {
        const icon = toggleLink.querySelector('i');
        audio.pause(); 
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
        toggleLink.setAttribute('aria-label', 'Włącz muzykę');
        toggleLink.setAttribute('aria-pressed', 'false');

        toggleLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (audio.paused) {
                audio.play().catch(error => {console.warn("Autoodtwarzanie zablokowane.");});
                icon.classList.remove('fa-volume-mute');
                icon.classList.add('fa-volume-up');
                toggleLink.classList.remove('muted');
                toggleLink.setAttribute('aria-label', 'Wyłącz muzykę');
                toggleLink.setAttribute('aria-pressed', 'true');
            } else {
                audio.pause();
                icon.classList.remove('fa-volume-up');
                icon.classList.add('fa-volume-mute');
                toggleLink.classList.add('muted');
                toggleLink.setAttribute('aria-label', 'Włącz muzykę');
                toggleLink.setAttribute('aria-pressed', 'false');
            }
        });
    }
    
    const modal = document.getElementById('modal-zrodla');
    const openLink = document.getElementById('open-zrodla-modal');
    const closeBtn = document.getElementById('close-zrodla-modal');
    if (modal && openLink && closeBtn) {
        openLink.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('is-active');
        });
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.remove('is-active');
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('is-active');
            }
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('is-active')) {
                modal.classList.remove('is-active');
            }
        });
    }

    if (hamburgerBtn && mainMenu) {
        hamburgerBtn.addEventListener('click', function() {
            mainMenu.classList.toggle('is-active');
            this.classList.toggle('is-active');
            const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;
            this.setAttribute('aria-expanded', !isExpanded);
        });
        mainMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainMenu.classList.contains('is-active')) {
                    mainMenu.classList.remove('is-active');
                    hamburgerBtn.classList.remove('is-active');
                    hamburgerBtn.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
});
document.querySelectorAll('.card-video').forEach(card => {
  const video = card.querySelector('video');
  const btn = card.querySelector('.video-play-btn');

  if (!video || !btn) return;

  const toggle = () => {
    if (video.paused) {
      video.muted = false;
      video.play();
      card.classList.add('is-playing');
    } else {
      video.pause();
      card.classList.remove('is-playing');
    }
  };

  btn.addEventListener('click', toggle);
  video.addEventListener('click', toggle);

  video.addEventListener('ended', () => {
    video.currentTime = 0;
    card.classList.remove('is-playing');
  });
});


