'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsListViewController', ['$scope', '$state', '$rootScope', '$translate', '$stateParams', 'spinner',
        'appointmentsService', 'appService', 'appointmentsFilter', 'printer', 'checkinPopUp', 'confirmBox', 'ngDialog', 'messagingService', 'appointmentCommonService', '$interval',
        function ($scope, $state, $rootScope, $translate, $stateParams, spinner, appointmentsService, appService,
                  appointmentsFilter, printer, checkinPopUp, confirmBox, ngDialog, messagingService, appointmentCommonService, $interval) {
            $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
            $scope.enableServiceTypes = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
            $scope.priorityOptionsList = appService.getAppDescriptor().getConfigValue('priorityOptionsList') || [];
            $scope.allowedActions = appService.getAppDescriptor().getConfigValue('allowedActions') || [];
            $scope.allowedActionsByStatus = appService.getAppDescriptor().getConfigValue('allowedActionsByStatus') || {};
            $scope.colorsForListView = appService.getAppDescriptor().getConfigValue('colorsForListView') || {};
            var maxAppointmentProviders = appService.getAppDescriptor().getConfigValue('maxAppointmentProviders') || 1;
            var allowVirtualConsultation = appService.getAppDescriptor().getConfigValue('allowVirtualConsultation');
            $scope.enableResetAppointmentStatuses = appService.getAppDescriptor().getConfigValue('enableResetAppointmentStatuses');
            $scope.isAppointmentRequestEnabled = appService.getAppDescriptor().getConfigValue('enableAppointmentRequests');
            $scope.disableDatesForWaitListAppointment = appService.getAppDescriptor().getConfigValue('disableDatesForWaitListAppointment');
            $scope.manageAppointmentPrivilege = Bahmni.Appointments.Constants.privilegeManageAppointments;
            $scope.ownAppointmentPrivilege = Bahmni.Appointments.Constants.privilegeOwnAppointments;
            $scope.resetAppointmentStatusPrivilege = Bahmni.Appointments.Constants.privilegeResetAppointmentStatus;
            $scope.shouldShowAppointmentsListPatientLink = !!Bahmni.Common.Constants.appointmentsListPatientLink;
            $scope.searchedPatient = false;
            $scope.enableColumnForTab = function(tabName){
                if($scope.getCurrentTabName() === tabName)
                    return true
                return false
            }
            var autoRefreshIntervalInSeconds = parseInt(appService.getAppDescriptor().getConfigValue('autoRefreshIntervalInSeconds'));
            var enableAutoRefresh = !isNaN(autoRefreshIntervalInSeconds);
            var autoRefreshStatus = true;
            const APPOINTMENT_STATUS_WAITLIST = $scope.disableDatesForWaitListAppointment ? {"withoutDates": true} : {"status" : "WaitList"};
            const APPOINTMENTS_TAB_NAME = "appointments";
            const AWAITING_APPOINTMENTS_TAB_NAME = "awaitingappointments";
            const SECONDS_TO_MILLISECONDS_FACTOR = 1000;
            var oldPatientData = [];
            var currentUserPrivileges = $rootScope.currentUser.privileges;
            var currentProviderUuId = $rootScope.currentProvider.uuid;
            $scope.$on('filterClosedOpen', function (event, args) {
                $scope.isFilterOpen = args.filterViewStatus;
            });

            var updateTableHeader = function (){
            $scope.tableInfo = [{heading: 'APPOINTMENT_PATIENT_ID', sortInfo: 'patient.identifier', class: true, enable: true},
                {heading: 'APPOINTMENT_CREATION_DATE', sortInfo: 'dateCreated', class: true, enable: !$scope.enableColumnsForAppointments},
                {heading: 'APPOINTMENT_PATIENT_NAME', sortInfo: 'patient.name', class: true, enable: true},
                {heading: 'APPOINTMENT_DATE', sortInfo: 'date', enable: $scope.enableColumnsForAppointments},
                {heading: 'APPOINTMENT_START_TIME_KEY', sortInfo: 'startDateTime', enable: $scope.enableColumnsForAppointments},
                {heading: 'APPOINTMENT_END_TIME_KEY', sortInfo: 'endDateTime', enable: $scope.enableColumnsForAppointments},
                {heading: 'APPOINTMENT_PROVIDER', sortInfo: 'provider.name', class: true, enable: true},
                {heading: 'APPOINTMENT_CATEGORY', sortInfo: 'priority', class: true, enable: !$scope.enableColumnsForAppointments},
                {heading: 'APPOINTMENT_SERVICE_SPECIALITY_KEY', sortInfo: 'service.speciality.name', class: true, enable: $scope.enableSpecialities},
                {heading: 'APPOINTMENT_SERVICE', sortInfo: 'service.name', class: true, enable: true},
                {heading: 'APPOINTMENT_SERVICE_TYPE_FULL', sortInfo: 'serviceType.name', class: true, enable: $scope.enableServiceTypes},
                {heading: 'APPOINTMENT_STATUS', sortInfo: 'status', enable: true},
                {heading: 'APPOINTMENT_WALK_IN', sortInfo: 'appointmentKind', enable: $scope.enableColumnsForAppointments},
                {heading: 'APPOINTMENT_SERVICE_LOCATION_KEY', sortInfo: 'location.name', class: true, enable: true},
                {heading: 'APPOINTMENT_SERVICE_AVAILABILITY_START_TIME_KEY', sortInfo: 'startDateTime', class: true, enable: (!$scope.disableDatesForWaitListAppointment && $scope.getCurrentTabName() === 'awaitingappointments')},
                {heading: 'APPOINTMENT_ADDITIONAL_INFO', sortInfo: 'additionalInfo', class: true, enable: true},
                {heading: 'APPOINTMENT_CREATE_NOTES', sortInfo: 'comments', enable: true}];
            }

            var init = function () {
                $scope.searchedPatient = $stateParams.isSearchEnabled && $stateParams.patient;
                $scope.startDate = $stateParams.viewDate || moment().startOf('day').toDate();
                $scope.isFilterOpen = $stateParams.isFilterOpen;
                $scope.enableColumnsForAppointments = $scope.enableColumnForTab(APPOINTMENTS_TAB_NAME)
                updateTableHeader();
                appointmentCommonService.addProviderToFilterFromQueryString();
            };

            var setAppointments = function (params) {
                autoRefreshStatus = false;
                if($scope.getCurrentTabName() === APPOINTMENTS_TAB_NAME)
                    return appointmentsService.getAllAppointments(params)
                    .then((response) => updateAppointments(response));
                else
                    return appointmentsService.search(APPOINTMENT_STATUS_WAITLIST)
                    .then((response) => updateAppointments(response))
                    // .catch((error) => messagingService.showMessage('error', 'APPOINTMENT_SEARCH_TIME_ERROR'));
            };

            var updateAppointments = function (response){
                $scope.appointments = response.data;
                $scope.filteredAppointments = appointmentsFilter($scope.appointments, $stateParams.filterParams);
                if($scope.getCurrentTabName() === AWAITING_APPOINTMENTS_TAB_NAME){
                    modifyAppointmentPriorities();
                    $scope.filteredAppointments = _.sortBy($scope.filteredAppointments, "dateCreated");
                }
                $rootScope.appointmentsData = $scope.filteredAppointments;
                updateSelectedAppointment();
                autoRefreshStatus = true;
            }

            var updateSelectedAppointment = function () {
                if ($scope.selectedAppointment === undefined) {
                    return;
                }
                $scope.selectedAppointment = _.find($scope.filteredAppointments, function (appointment) {
                    return appointment.uuid === $scope.selectedAppointment.uuid;
                });
            };

            var modifyAppointmentPriorities = function(){
                $scope.appointments.map((appointment) => {
                    var priorityModified = false;
                    $scope.priorityOptionsList.map((priority) => {
                        if(priority.value === appointment.priority){
                            appointment.priority = priority.label;
                            priorityModified = true;
                        }
                    });
                    if(priorityModified) return ;
                });
            }

            var sortAppointmentsByAppointmentCreationDate = function(a,b){
                return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
            }

            var setAppointmentsInPatientSearch = function (patientUuid) {
                appointmentsService.search({patientUuids: [patientUuid]}).then(function (response) {
                    var appointmentsInDESCOrderBasedOnStartDateTime = _.sortBy(response.data, "startDateTime").reverse();
                    setFilteredAppointmentsInPatientSearch(appointmentsInDESCOrderBasedOnStartDateTime);
                });
            };

            var setAppointmentsInAutoRefresh = function () {
                if (!autoRefreshStatus) {
                    return;
                }
                if ($stateParams.isSearchEnabled) {
                        setAppointmentsInPatientSearch($stateParams.patient.uuid);
                }
                else {
                    var viewDate = $state.params.viewDate || moment().startOf('day').toDate();
                    setAppointments({forDate: viewDate});
                }
            };

            $scope.translateAppointmentStatus = function (appointmentStatus) {
                if(appointmentStatus === "WaitList")
                    return $translate.instant("APPOINTMENT_WAITLIST");
                return appointmentStatus;
            }

            $scope.getCurrentTabName = function(){
                return $state.current.tabName;
            }

            var autoRefresh = (function () {
                if (!enableAutoRefresh) {
                    return;
                }
                var autoRefreshIntervalInMilliSeconds = autoRefreshIntervalInSeconds * SECONDS_TO_MILLISECONDS_FACTOR;
                return $interval(setAppointmentsInAutoRefresh, autoRefreshIntervalInMilliSeconds);
            })();

            $scope.$on('$destroy', function () {
                if (enableAutoRefresh) {
                    $interval.cancel(autoRefresh);
                }
            });

            $scope.getAppointmentsForDate = function (viewDate) {
                $stateParams.viewDate = viewDate;
                $scope.selectedAppointment = undefined;
                var params = {forDate: viewDate};
                $scope.$on('$stateChangeStart', function (event, toState, toParams) {
                    if (toState.tabName == 'calendar') {
                        toParams.doFetchAppointmentsData = false;
                    }
                });
                if ($state.params.doFetchAppointmentsData) {
                    spinner.forPromise(setAppointments(params));
                } else {
                    $scope.filteredAppointments = appointmentsFilter($state.params.appointmentsData, $stateParams.filterParams);
                    $state.params.doFetchAppointmentsData = true;
                }
            };

            $scope.getProviderNamesForAppointment = function (appointment) {
                if (appointment.providers != undefined) {
                    return appointment.providers.filter(function (p) { return p.response != 'CANCELLED'; }).map(function (p) { return p.name; }).join(',');
                    // app.provider = app.providers.length > 0 ? app.providers[0] : null;
                } else {
                    return '';
                }
            };

            var setFilteredAppointmentsInPatientSearch = function (appointments) {
                $scope.filteredAppointments = appointments.map(function (appointment) {
                    appointment.date = appointment.startDateTime;
                    return appointment;
                });
            };

            $scope.displaySearchedPatient = function (appointments) {
                oldPatientData = $scope.filteredAppointments;
                setFilteredAppointmentsInPatientSearch(appointments);
                $scope.searchedPatient = true;
                $stateParams.isFilterOpen = false;
                $scope.isFilterOpen = false;
                $stateParams.isSearchEnabled = true;
                $scope.selectedAppointment = undefined;
            };

            $scope.hasNoAppointments = function () {
                return _.isEmpty($scope.filteredAppointments);
            };

            $scope.goBackToPreviousView = function () {
                $scope.searchedPatient = false;
                $scope.filteredAppointments = oldPatientData;
                $stateParams.isFilterOpen = true;
                $scope.isFilterOpen = true;
                $stateParams.isSearchEnabled = false;
            };

            $scope.isSelected = function (appointment) {
                return $scope.selectedAppointment === appointment;
            };

            $scope.select = function (appointment) {
                if ($scope.isSelected(appointment)) {
                    $scope.selectedAppointment = undefined;
                    return;
                }
                $scope.selectedAppointment = appointment;
            };

            $scope.isWalkIn = function (appointmentType) {
                return appointmentType === 'WalkIn' ? 'Yes' : 'No';
            };

            $scope.editAppointment = function () {     
                var params = $stateParams;
                params.uuid = $scope.selectedAppointment.uuid;
                params.isRecurring = $scope.selectedAppointment.recurring;
                params.filterParams.statusList = [];
                $state.go('home.manage.appointments.list.edit', params);
            };

            $scope.openTeleConsultation = function () {
                window.open("https://" + 
                    window.location.hostname + 
                    Bahmni.Common.Constants.patientsURL + 
                    $scope.selectedAppointment.patient.uuid +
                    Bahmni.Common.Constants.patientsURLGeneralInformationTab
                    , '_self')
            }; 
            
            $scope.copyTeleConsultationMeetingURL = function () {
                var jitsiMeetingUrl = $scope.selectedAppointment.teleconsultationLink;
                const el = document.createElement('textarea');
                el.value = jitsiMeetingUrl;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
            };

            $scope.checkinAppointment = function () {
                var scope = $rootScope.$new();
                scope.message = $translate.instant('APPOINTMENT_STATUS_CHANGE_CONFIRM_MESSAGE', {
                    toStatus: 'CheckedIn'
                });
                scope.action = _.partial(changeStatus, 'CheckedIn', _);
                checkinPopUp({
                    scope: scope,
                    className: "ngdialog-theme-default app-dialog-container"
                });
            };

            $scope.generateAppointmentsListPatientLink = function (appointment) {
                return appService.getAppDescriptor().formatUrl(Bahmni.Common.Constants.appointmentsListPatientLink, { patientId: appointment.patient.uuid });
            }

            function isNullOrEmpty(obj) {
                return obj === null || obj === undefined || Object.keys(obj).length === 0;
            }

            $scope.$watch(function () {
                return $stateParams.filterParams;
            }, function (newValue, oldValue) {
                if (newValue !== oldValue && !isNullOrEmpty(oldValue)) {
                    $scope.filteredAppointments = appointmentsFilter($scope.appointments || $state.params.appointmentsData, $stateParams.filterParams);
                }
            }, true);

            $scope.sortAppointmentsBy = function (sortColumn) {
                if (sortColumn === 'additionalInfo') {
                    $scope.filteredAppointments = $scope.filteredAppointments.map(function (appointment) {
                        appointment.additionalInformation = $scope.display(_.get(appointment, sortColumn));
                        return appointment;
                    });
                    sortColumn = "additionalInformation";
                }

                var emptyObjects = _.filter($scope.filteredAppointments, function (appointment) {
                    return !_.property(sortColumn)(appointment);
                });

                if (sortColumn === "provider.name") {
                    emptyObjects = $scope.filteredAppointments.filter(function (fa) {
                        return _.every(fa.providers, {"response": Bahmni.Appointments.Constants.providerResponses.CANCELLED }) || _.isEmpty(fa.providers);
                    });
                }

                var nonEmptyObjects = _.difference($scope.filteredAppointments, emptyObjects);
                var sortedNonEmptyObjects = _.sortBy(nonEmptyObjects, function (appointment) {
                    if (sortColumn === "provider.name") {
                        var firstProvider = appointment.providers.find(function (p) {
                            return p.response !== Bahmni.Appointments.Constants.providerResponses.CANCELLED;
                        });
                        return firstProvider.name.toLowerCase();
                    }

                    if (angular.isNumber(_.get(appointment, sortColumn))) {
                        return _.get(appointment, sortColumn);
                    }
                    return _.get(appointment, sortColumn).toLowerCase();
                });
                if ($scope.reverseSort) {
                    sortedNonEmptyObjects.reverse();
                }
                $scope.filteredAppointments = sortedNonEmptyObjects.concat(emptyObjects);
                $scope.sortColumn = sortColumn;
                $scope.reverseSort = !$scope.reverseSort;
            };

            $rootScope.$on('awaitingFilterResponse', function (event, response) {
                $scope.filteredAppointments = response.data;
            });
            
            $scope.printPage = function () {
                var printTemplateUrl = appService.getAppDescriptor().getConfigValue("printListViewTemplateUrl") || 'views/manage/list/defaultListPrint.html';
                printer.print(printTemplateUrl, {
                    searchedPatient: $scope.searchedPatient,
                    filteredAppointments: $scope.filteredAppointments,
                    startDate: $stateParams.viewDate,
                    enableServiceTypes: $scope.enableServiceTypes,
                    enableSpecialities: $scope.enableSpecialities
                });
            };

            $scope.undoCheckIn = function () {
                var scope = {};
                scope.message = $translate.instant('APPOINTMENT_UNDO_CHECKIN_CONFIRM_MESSAGE');
                scope.yes = resetStatus;
                showPopUp(scope);
            };

            var resetStatus = function (closeConfirmBox) {
                return appointmentsService.changeStatus($scope.selectedAppointment.uuid, 'Scheduled', null).then(function (response) {
                    $scope.selectedAppointment.status = response.data.status;
                    var message = $translate.instant('APPOINTMENT_STATUS_CHANGE_SUCCESS_MESSAGE', {
                        toStatus: response.data.status
                    });
                    closeConfirmBox();
                    messagingService.showMessage('info', message);
                });
            };

            $scope.reset = function () {
                var scope = {};
                scope.message = $translate.instant('APPOINTMENT_RESET_CONFIRM_MESSAGE');
                scope.yes = resetStatus;
                showPopUp(scope);
            };

            const findCurrentProviderInAppointment = function(appointment) {
                return _.find(appointment.providers, function (provider) {
                    return provider.uuid === currentProviderUuId;
                });
            };

            $scope.isSelectedAppointmentAwaitingForCurrentProvider = function(){
                if (!$scope.isAppointmentRequestEnabled || !$scope.selectedAppointment) return false;
                const currentProviderInAppointment = findCurrentProviderInAppointment($scope.selectedAppointment);
                return !(_.isUndefined(currentProviderInAppointment)) &&
                    currentProviderInAppointment.response === Bahmni.Appointments.Constants.providerResponses.AWAITING;
            };

            function acceptAppointmentInvite(closeConfirmBox) {
                const currentProviderInAppointment = findCurrentProviderInAppointment($scope.selectedAppointment);

                const message = $translate.instant('PROVIDER_RESPONSE_ACCEPT_SUCCESS_MESSAGE');
                return appointmentsService.changeProviderResponse($scope.selectedAppointment.uuid, currentProviderInAppointment.uuid,
                    Bahmni.Appointments.Constants.providerResponses.ACCEPTED).then(function () {
                    currentProviderInAppointment.response = Bahmni.Appointments.Constants.providerResponses.ACCEPTED;
                    closeConfirmBox();
                    messagingService.showMessage('info', message);
                });
            }

            $scope.acceptInviteForCurrentProvider = function() {
                var scope = {};
                scope.message = $translate.instant('APPOINTMENT_ACCEPT_CONFIRM_MESSAGE');
                scope.yes = acceptAppointmentInvite;
                showPopUp(scope);
            };

            var changeStatus = function (toStatus, onDate, closeConfirmBox, applyForAll) {
                var message = $translate.instant('APPOINTMENT_STATUS_CHANGE_SUCCESS_MESSAGE', {
                    toStatus: toStatus
                });
                return appointmentsService.changeStatus($scope.selectedAppointment.uuid, toStatus, onDate, applyForAll).then(function (response) {
                    ngDialog.close();
                    $scope.selectedAppointment.status = response.data.status;
                    closeConfirmBox();
                    messagingService.showMessage('info', message);
                    $scope.filteredAppointments = appointmentsFilter($scope.appointments, $stateParams.filterParams);
                    $state.reload();
                });
            };

            $scope.confirmAction = function (toStatus) {
                var scope = {};
                scope.yes = _.partial(changeStatus, toStatus, undefined, _, "false");
                if (toStatus === 'Cancelled' && $scope.selectedAppointment.recurring) {
                    scope.message = $translate.instant('APPOINTMENT_STATUS_CANCEL_CONFIRM_MESSAGE', {
                        toStatus: toStatus
                    });
                    scope.yes_all = _.partial(changeStatus, toStatus, undefined, _, "true");
                } else
                    scope.message = $translate.instant('APPOINTMENT_STATUS_CHANGE_CONFIRM_MESSAGE', {
                        toStatus: toStatus
                    });
                showPopUp(scope);
            };

            $scope.display = function (jsonObj) {
                jsonObj = _.mapKeys(jsonObj, function (value, key) {
                    return $translate.instant(key);
                });
                return JSON.stringify(jsonObj || '').replace(/[{\"}]/g, "").replace(/[,]/g, ",\t");
            };

            var showPopUp = function (popUpScope) {
                popUpScope.no = function (closeConfirmBox) {
                    closeConfirmBox();
                };
                var actions = [{name: 'yes', display: 'YES_KEY'}, {name: 'no', display: 'NO_KEY'}];
                if (popUpScope.yes_all !== undefined) {
                    actions = [{name: 'yes', display: 'RECURRENCE_THIS_APPOINTMENT'},
                        {name: 'yes_all', display: 'RECURRENCE_ALL_APPOINTMENTS'},
                        {name: 'no', display: 'DONT_CANCEL_KEY', class: 'right'}];
                }
                confirmBox({
                    scope: popUpScope,
                    actions: actions,
                    className: "ngdialog-theme-default"
                });
            };

            $scope.isAllowedAction = function (action) {
                return _.includes($scope.allowedActions, action);
            };

            $scope.isValidActionAndIsUserAllowedToPerformEdit = function (action) {
                if (!_.isUndefined($scope.selectedAppointment)) {
                    var appointmentProvider = $scope.selectedAppointment.providers;
                    return !appointmentCommonService.isUserAllowedToPerformEdit(appointmentProvider, currentUserPrivileges, currentProviderUuId)
                        ? false : isValidAction(action);
                }
                return false;
            };

            var isValidAction = function (action) {
                var status = $scope.selectedAppointment.status;
                var allowedActions = $scope.allowedActionsByStatus.hasOwnProperty(status) ? $scope.allowedActionsByStatus[status] : [];
                return _.includes(allowedActions, action);
            };

            var isCurrentUserHavePrivilege = function (privilege) {
                return !_.isUndefined(_.find($rootScope.currentUser.privileges, function (userPrivilege) {
                    return userPrivilege.name === privilege;
                }));
            };

            $scope.isUserAllowedToPerform = function () {
                if (isCurrentUserHavePrivilege($scope.manageAppointmentPrivilege)) {
                    return true;
                }
                else if (isCurrentUserHavePrivilege($scope.ownAppointmentPrivilege)) {
                    if ($scope.selectedAppointment) {
                        return _.isNull($scope.selectedAppointment.provider) ||
                            $scope.selectedAppointment.provider.uuid === $rootScope.currentProvider.uuid;
                    }
                }
                return false;
            };

            $scope.isUndoCheckInAllowed = function () {
                return $scope.isUserAllowedToPerform() &&
                    isCurrentUserHavePrivilege($scope.resetAppointmentStatusPrivilege) &&
                    $scope.selectedAppointment &&
                    $scope.selectedAppointment.status === 'CheckedIn';
            };

            $scope.isEditAllowed = function () {
                if (!_.isUndefined($scope.selectedAppointment)) {
                    var appointmentProvider = $scope.selectedAppointment.providers;
                    return maxAppointmentProviders > 1 ? true : appointmentCommonService.isUserAllowedToPerformEdit(appointmentProvider, currentUserPrivileges, currentProviderUuId);
                }
                return false;
            };

            $scope.isVirtualConsultationEnabled = function () {
                return allowVirtualConsultation === true;
            }

            $scope.isTeleconsultationAllowed = function () {
                if (!_.isUndefined($scope.selectedAppointment)) {
                    return $scope.selectedAppointment.appointmentKind === "Virtual" && $scope.selectedAppointment.status == window.Bahmni.Appointments.Constants.appointmentStatuses.Scheduled;
                }
                return false;
            };

            $scope.isResetAppointmentStatusFeatureEnabled = function () {
                return !(_.isNull($scope.enableResetAppointmentStatuses) ||
                    _.isUndefined($scope.enableResetAppointmentStatuses));
            };

            var isSelectedAppointmentStatusAllowedToReset = function () {
                return _.isArray($scope.enableResetAppointmentStatuses) &&
                    _.includes($scope.enableResetAppointmentStatuses, $scope.selectedAppointment.status);
            };

            $scope.isResetAppointmentStatusAllowed = function () {
                return $scope.isUserAllowedToPerform() &&
                    isCurrentUserHavePrivilege($scope.resetAppointmentStatusPrivilege) &&
                    $scope.selectedAppointment &&
                    $scope.selectedAppointment.status != 'Scheduled' &&
                    isSelectedAppointmentStatusAllowedToReset();
            };

            init();
        }]);
