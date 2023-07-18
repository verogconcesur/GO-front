/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowFilterDTO from '@data/models/workflows/workflow-filter-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import lodash from 'lodash';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowFilterService {
  //Stores the filter selection.
  public workflowFilterSubject$: BehaviorSubject<WorkflowFilterDTO> = new BehaviorSubject({
    states: [],
    subStates: [],
    users: [],
    priorities: [],
    substatesWithCards: 'BOTH'
  });
  //Stores the filter options to show
  public workflowFilterOptionsSubject$: BehaviorSubject<WorkflowFilterDTO> = new BehaviorSubject({
    states: [],
    subStates: [],
    users: [],
    priorities: [],
    substatesWithCards: 'BOTH'
  });

  constructor() {}

  public resetWorkflowFilter(): void {
    const filterR: WorkflowFilterDTO = {
      states: [],
      subStates: [],
      users: [],
      priorities: [],
      substatesWithCards: 'BOTH'
    };
    this.workflowFilterSubject$.next(filterR);
    this.workflowFilterOptionsSubject$.next(filterR);
  }

  public isWorkflowFilterActive(): boolean {
    const filterValue = this.workflowFilterSubject$.getValue();
    if (
      filterValue &&
      (filterValue.states.length ||
        filterValue.subStates.length ||
        filterValue.users.length ||
        filterValue.priorities.length ||
        filterValue.substatesWithCards !== 'BOTH')
    ) {
      return true;
    }
    return false;
  }

  public showOnlySubstatesWithCards(): 'BOTH' | 'WITH_CARDS' | 'WHITHOUT_CARDS' {
    return this.workflowFilterSubject$.getValue()?.substatesWithCards;
  }

  public getFilterInfo(data: WorkflowStateDTO[]): void {
    const subStates: WorkflowSubstateDTO[] = [];
    const users: WorkflowSubstateUserDTO[] = [];
    const priorities: string[] = [];
    const substatesWithCards = 'BOTH';
    data.forEach((states: WorkflowStateDTO) => {
      states.workflowSubstates.forEach((subState: WorkflowSubstateDTO) => {
        //Substate
        const similarSubState = subStates.find((ss: WorkflowSubstateDTO) => ss.name === subState.name);
        if (similarSubState) {
          similarSubState.substatesIdsToFilter.push(subState.id);
        } else {
          subStates.push({
            ...subState,
            substatesIdsToFilter: [...(subState.substatesIdsToFilter ? subState.substatesIdsToFilter : []), subState.id]
          });
        }
        //User
        subState.workflowSubstateUser.forEach((subStateUser: WorkflowSubstateUserDTO) => {
          const userFound = users.find((user: WorkflowSubstateUserDTO) => user.user.id === subStateUser.user.id);
          if (!userFound) {
            users.push({
              ...subStateUser,
              substatesIdsToFilter: [...(subState.substatesIdsToFilter ? subState.substatesIdsToFilter : []), subState.id]
            });
          } else {
            userFound.substatesIdsToFilter.push(subState.id);
          }
        });

        //TODO PRIORITIES
      });
    });
    const filterOptions: WorkflowFilterDTO = {
      states: [...data],
      subStates: [...subStates],
      users: [...users],
      priorities: [...priorities],
      substatesWithCards
    };
    this.workflowFilterOptionsSubject$.next(filterOptions);
  }

  //Primero ordenamos por fecha ASC, luego por orderNumber DESC
  //DGDC cuando pongamos el orden por drag and drop cambiar el orden
  //Primero ordenamos por orderNumber DESC, luego por  fecha ASC
  public orderCardsByOrderNumber(cards: WorkflowCardDTO[]): WorkflowCardDTO[] {
    cards.sort((a, b) => a.cardInstanceWorkflows[0].dateAssignmentSubstate - b.cardInstanceWorkflows[0].dateAssignmentSubstate);
    return cards.sort((a, b) => b.cardInstanceWorkflows[0].orderNumber - a.cardInstanceWorkflows[0].orderNumber);
  }

  public filterData(workflowInstances: WorkflowStateDTO[], filter: WorkflowFilterDTO): WorkflowStateDTO[] {
    let wStatesData: WorkflowStateDTO[] = lodash.cloneDeep(workflowInstances);
    const filters = JSON.parse(JSON.stringify(filter));

    //Filtro estados
    if (filters.states?.length) {
      const statesIds = filters.states.map((w: WorkflowStateDTO) => w.id);
      wStatesData = wStatesData.filter((ws: WorkflowStateDTO) => statesIds.indexOf(ws.id) >= 0);
    }

    //Filtro subestados
    let substatesIdsToFilter: number[] = [];
    if (filters.subStates?.length) {
      filters.subStates.forEach(
        (w: WorkflowSubstateDTO) => (substatesIdsToFilter = [...substatesIdsToFilter, ...w.substatesIdsToFilter])
      );
      wStatesData = wStatesData.map((ws: WorkflowStateDTO) => {
        //No filtramos nada del estado ancla
        if (!ws.anchor) {
          ws.workflowSubstates = ws.workflowSubstates.filter(
            (wss: WorkflowSubstateDTO) => substatesIdsToFilter.indexOf(wss.id) >= 0
          );
        }
        return ws;
      });
      wStatesData = wStatesData.filter((ws: WorkflowStateDTO) => ws.workflowSubstates.length > 0);
    }

    //Filtro Prioridad

    //Filtro subestados y usuarios con tarjetas
    if (filters.substatesWithCards === 'WITH_CARDS') {
      //Filtramos estados vacíos
      wStatesData = wStatesData.filter((ws: WorkflowStateDTO) => {
        let isEmpty = true;
        //No filtramos nada del estado ancla
        if (ws.anchor) {
          isEmpty = false;
        } else {
          ws.workflowSubstates.forEach((wss: WorkflowSubstateDTO) => {
            if (wss.cards.length) {
              isEmpty = false;
            }
          });
        }
        return !isEmpty;
      });
      //Filtramos subestados vacíos
      wStatesData = wStatesData.map((ws: WorkflowStateDTO) => {
        if (ws.anchor) {
          return ws;
        } else if (ws.front) {
          //Si es portada filtramos por usuario y subestados vacíos
          const dataByUser: any = {};
          ws.workflowSubstates = ws.workflowSubstates.map((wss: WorkflowSubstateDTO) => {
            wss.workflowSubstateUser = wss.workflowSubstateUser.map((wssu: WorkflowSubstateUserDTO) => {
              const newCardsBySubstateId: any = {};
              Object.keys(wssu.cardsBySubstateId).forEach((k) => {
                if (
                  wssu.cardsBySubstateId[k].length &&
                  (substatesIdsToFilter.length === 0 || substatesIdsToFilter.indexOf(parseInt(k, 10)) >= 0)
                ) {
                  newCardsBySubstateId[k] = wssu.cardsBySubstateId[k];
                }
              });
              wssu.cardsBySubstateId = newCardsBySubstateId;
              if (dataByUser[wssu.user.id]) {
                wssu.cards = this.orderCardsByOrderNumber([...wssu.cards, ...dataByUser[wssu.user.id].cards]);
                wssu.cardsBySubstateId = { ...wssu.cardsBySubstateId, ...dataByUser[wssu.user.id].cardsBySubstateId };
                dataByUser[wssu.user.id] = wssu;
              } else {
                dataByUser[wssu.user.id] = wssu;
              }
              return wssu;
            });
            return wss;
          });
          ws.workflowUsers = ws.workflowUsers
            ?.map((wssu: WorkflowSubstateUserDTO) => dataByUser[wssu.user.id])
            .filter((wssu: WorkflowSubstateUserDTO) => wssu?.cards?.length);
        } else {
          ws.workflowSubstates = ws.workflowSubstates.filter((wss: WorkflowSubstateDTO) => wss?.cards?.length > 0);
        }
        return ws;
      });
    }

    //Filtro subestados y usuarios sin tarjetas
    if (filters.substatesWithCards === 'WITHOUT_CARDS') {
      //Filtramos estados completamente llenos / sólo aplica a estados que nos son portada
      wStatesData = wStatesData.filter((ws: WorkflowStateDTO) => {
        let haveAllSubstatesData = true;
        //No filtramos nada del estado ancla
        if (!ws.anchor && !ws.front) {
          ws.workflowSubstates.forEach((wss: WorkflowSubstateDTO) => {
            if (wss.cards.length === 0) {
              haveAllSubstatesData = false;
            }
          });
        } else {
          haveAllSubstatesData = false;
        }
        return !haveAllSubstatesData;
      });
      //Filtramos subestados llenos
      wStatesData = wStatesData.map((ws: WorkflowStateDTO) => {
        if (ws.anchor) {
          return ws;
        } else if (ws.front) {
          //Si es portada filtramos por usuario y subestados vacíos
          const dataByUser: any = {};
          ws.workflowSubstates = ws.workflowSubstates.map((wss: WorkflowSubstateDTO) => {
            wss.workflowSubstateUser = wss.workflowSubstateUser.map((wssu: WorkflowSubstateUserDTO) => {
              const newCardsBySubstateId: any = {};
              Object.keys(wssu.cardsBySubstateId).forEach((k) => {
                if (
                  wssu.cardsBySubstateId[k].length === 0 &&
                  (substatesIdsToFilter.length === 0 || substatesIdsToFilter.indexOf(parseInt(k, 10)) >= 0)
                ) {
                  newCardsBySubstateId[k] = wssu.cardsBySubstateId[k];
                }
              });
              wssu.cardsBySubstateId = newCardsBySubstateId;
              if (dataByUser[wssu.user.id]) {
                wssu.cards = this.orderCardsByOrderNumber([...wssu.cards, ...dataByUser[wssu.user.id].cards]);
                wssu.cardsBySubstateId = { ...wssu.cardsBySubstateId, ...dataByUser[wssu.user.id].cardsBySubstateId };
                dataByUser[wssu.user.id] = wssu;
              } else {
                dataByUser[wssu.user.id] = wssu;
              }
              return wssu;
            });
            return wss;
          });
          ws.workflowUsers = ws.workflowUsers
            ?.map((wssu: WorkflowSubstateUserDTO) => dataByUser[wssu.user.id])
            .filter(
              (wssu: WorkflowSubstateUserDTO) =>
                !wssu.cards ||
                wssu.cards.length === 0 ||
                Object.keys(wssu.cardsBySubstateId).filter((k) => wssu.cardsBySubstateId[k].length === 0).length > 0
            );
        } else {
          ws.workflowSubstates = ws.workflowSubstates.filter((wss: WorkflowSubstateDTO) => !wss.cards || wss.cards.length === 0);
        }
        return ws;
      });
    }

    //Filtro Usuarios
    if (filter.users?.length > 0) {
      const usersToFilterIds = filter.users.map((wssu: WorkflowSubstateUserDTO) => wssu.user.id);
      wStatesData = wStatesData
        .filter((ws: WorkflowStateDTO) => {
          if (ws.anchor) {
            return true;
          } else if (ws.workflowUsers.filter((wssu: WorkflowSubstateUserDTO) => usersToFilterIds.indexOf(wssu.user.id) >= 0)) {
            return true;
          }
          return false;
        })
        .map((ws: WorkflowStateDTO) => {
          if (ws.anchor) {
            return ws;
          } else if (ws.front) {
            ws.workflowUsers = ws.workflowUsers.filter(
              (wssu: WorkflowSubstateUserDTO) => usersToFilterIds.indexOf(wssu.user.id) >= 0
            );
            return ws;
          } else if (!ws.front) {
            ws.workflowSubstates = ws.workflowSubstates
              .map((wss: WorkflowSubstateDTO) => {
                wss.cards = wss.cards.filter((card: WorkflowCardDTO) => {
                  let found = false;
                  card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers.forEach((user: WorkflowSubstateUserDTO) => {
                    if (usersToFilterIds.indexOf(user.userId) >= 0) {
                      found = true;
                    }
                  });
                  return found;
                });
                return wss;
              })
              .filter((wss: WorkflowSubstateDTO) => wss.cards.length);
            return ws;
          }
        })
        .filter((ws: WorkflowStateDTO) => {
          if (ws.anchor || ws.front) {
            return true;
          } else if (ws.workflowSubstates.length) {
            return true;
          }
          return false;
        });
    }

    //Si ya he filtrados por tajetas o sin tarjetas => tengo por cada estado los usuarios a visualizar
    // => si no hay usuarios significa que no debo mostrar el estado
    wStatesData = wStatesData.filter((ws: WorkflowStateDTO) => !ws.front || ws.workflowUsers?.length > 0);

    return wStatesData;
  }

  // Filters for table view

  public filterDataTable(workflowInstances: WorkflowStateDTO[], filter: WorkflowFilterDTO): WorkflowStateDTO[] {
    let wStatesData: WorkflowStateDTO[] = lodash.cloneDeep(workflowInstances);
    const filters = JSON.parse(JSON.stringify(filter));

    //Filtro Usuarios
    if (filter.users?.length > 0) {
      const usersToFilterIds = filter.users.map((wssu: WorkflowSubstateUserDTO) => wssu.user.id);
      wStatesData = wStatesData.map((ws: WorkflowStateDTO) => {
        if (ws.front) {
          ws.workflowSubstates = ws.workflowSubstates.map((wss: WorkflowSubstateDTO) => {
            wss.cards = wss.cards.filter(
              (card: WorkflowCardDTO) =>
                usersToFilterIds.indexOf(card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers[0].userId) >= 0
            );
            return wss;
          });
          return ws;
        } else {
          ws.workflowSubstates = ws.workflowSubstates.map((wss: WorkflowSubstateDTO) => {
            wss.cards = [];
            return wss;
          });
          return ws;
        }
      });
    }
    //Filtro estados
    if (filters.states?.length) {
      const statesIds = filters.states.map((w: WorkflowStateDTO) => w.id);
      wStatesData = wStatesData.filter((ws: WorkflowStateDTO) => statesIds.indexOf(ws.id) >= 0);
    }

    //Filtro subestados
    let substatesIdsToFilter: number[] = [];
    if (filters.subStates?.length) {
      filters.subStates.forEach(
        (w: WorkflowSubstateDTO) => (substatesIdsToFilter = [...substatesIdsToFilter, ...w.substatesIdsToFilter])
      );
      wStatesData = wStatesData.map((ws: WorkflowStateDTO) => {
        ws.workflowSubstates = ws.workflowSubstates.filter(
          (wss: WorkflowSubstateDTO) => substatesIdsToFilter.indexOf(wss.id) >= 0
        );
        return ws;
      });
      wStatesData = wStatesData.filter((ws: WorkflowStateDTO) => ws.workflowSubstates.length > 0);
    }

    //Filtro Prioridad

    //Filtro subestados y usuarios con tarjetas
    if (filters.substatesWithCards === 'WITH_CARDS') {
      //Filtramos estados vacíos
      wStatesData = wStatesData.filter((ws: WorkflowStateDTO) => {
        let isEmpty = true;
        //No filtramos nada del estado ancla

        ws.workflowSubstates.forEach((wss: WorkflowSubstateDTO) => {
          if (wss.cards.length) {
            isEmpty = false;
          }
        });
        return !isEmpty;
      });
      //Filtramos subestados vacíos
      wStatesData = wStatesData.map((ws: WorkflowStateDTO) => {
        ws.workflowSubstates = ws.workflowSubstates.filter((wss: WorkflowSubstateDTO) => wss?.cards?.length > 0);
        return ws;
      });
    }

    //Filtro subestados y usuarios sin tarjetas
    if (filters.substatesWithCards === 'WITHOUT_CARDS') {
      //Filtramos estados completamente llenos / sólo aplica a estados que nos son portada
      wStatesData = wStatesData.filter((ws: WorkflowStateDTO) => {
        let haveAllSubstatesData = true;
        ws.workflowSubstates.forEach((wss: WorkflowSubstateDTO) => {
          if (wss.cards.length === 0) {
            haveAllSubstatesData = false;
          }
        });
        return !haveAllSubstatesData;
      });
      //Filtramos subestados llenos
      wStatesData = wStatesData.map((ws: WorkflowStateDTO) => {
        ws.workflowSubstates = ws.workflowSubstates.filter((wss: WorkflowSubstateDTO) => !wss.cards || wss.cards.length === 0);
        return ws;
      });
    }

    return wStatesData;
  }
}
