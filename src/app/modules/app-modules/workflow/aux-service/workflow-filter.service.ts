/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import WorkflowFilterDto from '@data/models/workflows/workflow-filter-dto';
import WorkflowStateDto from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDto from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDto from '@data/models/workflows/workflow-substate-user-dto';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowFilterService {
  //Stores the filter selection.
  public workflowFilterSubject$: BehaviorSubject<WorkflowFilterDto> = new BehaviorSubject({
    states: [],
    subStates: [],
    users: [],
    priorities: [],
    substatesWithCards: 'BOTH'
  });
  //Stores the filter options to show
  public workflowFilterOptionsSubject$: BehaviorSubject<WorkflowFilterDto> = new BehaviorSubject({
    states: [],
    subStates: [],
    users: [],
    priorities: [],
    substatesWithCards: 'BOTH'
  });

  constructor() {}

  public resetWorkflowFilter(): void {
    const filterR: WorkflowFilterDto = {
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

  public getFilterInfo(data: WorkflowStateDto[]): void {
    const subStates: WorkflowSubstateDto[] = [];
    const users: WorkflowSubstateUserDto[] = [];
    const priorities: string[] = [];
    const substatesWithCards = 'BOTH';
    data.forEach((states: WorkflowStateDto) => {
      states.workflowSubstates.forEach((subState: WorkflowSubstateDto) => {
        //Substate
        const similarSubState = subStates.find((ss: WorkflowSubstateDto) => ss.name === subState.name);
        if (similarSubState) {
          similarSubState.substatesIdsToFilter.push(subState.id);
        } else {
          subStates.push({
            ...subState,
            substatesIdsToFilter: [...(subState.substatesIdsToFilter ? subState.substatesIdsToFilter : []), subState.id]
          });
        }
        //User
        subState.workflowSubstateUser.forEach((subStateUser: WorkflowSubstateUserDto) => {
          const userFound = users.find((user: WorkflowSubstateUserDto) => user.user.id === subStateUser.user.id);
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
    const filterOptions: WorkflowFilterDto = {
      states: [...data],
      subStates: [...subStates],
      users: [...users],
      priorities: [...priorities],
      substatesWithCards
    };
    this.workflowFilterOptionsSubject$.next(filterOptions);
  }

  public filterData(workflowInstances: WorkflowStateDto[], filter: WorkflowFilterDto): WorkflowStateDto[] {
    let wStatesData: WorkflowStateDto[] = JSON.parse(JSON.stringify(workflowInstances));
    const filters = JSON.parse(JSON.stringify(filter));

    //Filtro estados
    if (filters.states?.length) {
      const statesIds = filters.states.map((w: WorkflowStateDto) => w.id);
      wStatesData = wStatesData.filter((ws: WorkflowStateDto) => statesIds.indexOf(ws.id) >= 0);
    }

    //Filtro subestados
    let substatesIdsToFilter: number[] = [];
    if (filters.subStates?.length) {
      filters.subStates.forEach(
        (w: WorkflowSubstateDto) => (substatesIdsToFilter = [...substatesIdsToFilter, ...w.substatesIdsToFilter])
      );
      wStatesData = wStatesData.map((ws: WorkflowStateDto) => {
        //No filtramos nada del estado ancla
        if (!ws.anchor) {
          ws.workflowSubstates = ws.workflowSubstates.filter(
            (wss: WorkflowSubstateDto) => substatesIdsToFilter.indexOf(wss.id) >= 0
          );
        }
        return ws;
      });
      wStatesData = wStatesData.filter((ws: WorkflowStateDto) => ws.workflowSubstates.length > 0);
    }

    //Filtro Prioridad

    //Filtro subestados y usuarios con tarjetas
    if (filters.substatesWithCards === 'WITH_CARDS') {
      //Filtramos estados vacíos
      wStatesData = wStatesData.filter((ws: WorkflowStateDto) => {
        let isEmpty = true;
        //No filtramos nada del estado ancla
        if (ws.anchor) {
          isEmpty = false;
        } else {
          ws.workflowSubstates.forEach((wss: WorkflowSubstateDto) => {
            if (wss.cards.length) {
              isEmpty = false;
            }
          });
        }
        return !isEmpty;
      });
      //Filtramos subestados vacíos
      wStatesData = wStatesData.map((ws: WorkflowStateDto) => {
        if (ws.anchor) {
          return ws;
        } else if (ws.front) {
          //Si es portada filtramos por usuario y subestados vacíos
          const dataByUser: any = {};
          ws.workflowSubstates = ws.workflowSubstates.map((wss: WorkflowSubstateDto) => {
            wss.workflowSubstateUser = wss.workflowSubstateUser.map((wssu: WorkflowSubstateUserDto) => {
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
                wssu.cards = [...wssu.cards, ...dataByUser[wssu.user.id].cards];
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
            ?.map((wssu: WorkflowSubstateUserDto) => dataByUser[wssu.user.id])
            .filter((wssu: WorkflowSubstateUserDto) => wssu?.cards?.length);
        } else {
          ws.workflowSubstates = ws.workflowSubstates.filter((wss: WorkflowSubstateDto) => wss?.cards?.length > 0);
        }
        return ws;
      });
    }

    //Filtro subestados y usuarios sin tarjetas
    if (filters.substatesWithCards === 'WITHOUT_CARDS') {
      //Filtramos estados completamente llenos / sólo aplica a estados que nos son portada
      wStatesData = wStatesData.filter((ws: WorkflowStateDto) => {
        let haveAllSubstatesData = true;
        //No filtramos nada del estado ancla
        if (!ws.anchor && !ws.front) {
          ws.workflowSubstates.forEach((wss: WorkflowSubstateDto) => {
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
      wStatesData = wStatesData.map((ws: WorkflowStateDto) => {
        if (ws.anchor) {
          return ws;
        } else if (ws.front) {
          //Si es portada filtramos por usuario y subestados vacíos
          const dataByUser: any = {};
          ws.workflowSubstates = ws.workflowSubstates.map((wss: WorkflowSubstateDto) => {
            wss.workflowSubstateUser = wss.workflowSubstateUser.map((wssu: WorkflowSubstateUserDto) => {
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
                wssu.cards = [...wssu.cards, ...dataByUser[wssu.user.id].cards];
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
            ?.map((wssu: WorkflowSubstateUserDto) => dataByUser[wssu.user.id])
            .filter(
              (wssu: WorkflowSubstateUserDto) =>
                !wssu.cards ||
                wssu.cards.length === 0 ||
                Object.keys(wssu.cardsBySubstateId).filter((k) => wssu.cardsBySubstateId[k].length === 0).length > 0
            );
        } else {
          ws.workflowSubstates = ws.workflowSubstates.filter((wss: WorkflowSubstateDto) => !wss.cards || wss.cards.length === 0);
        }
        return ws;
      });
    }

    //Si ya he filtrados por tajetas o sin tarjetas => tengo por cada estado los usuarios a visualizar
    // => si no hay usuarios significa que no debo mostrar el estado
    wStatesData = wStatesData.filter((ws: WorkflowStateDto) => !ws.front || ws.workflowUsers.length > 0);

    //Filtro Usuarios
    if (filter.users?.length > 0) {
      const usersToFilterIds = filter.users.map((wssu: WorkflowSubstateUserDto) => wssu.user.id);
      wStatesData = wStatesData
        .filter((ws: WorkflowStateDto) => {
          if (ws.anchor) {
            return true;
          } else if (
            ws.front &&
            ws.workflowUsers.filter((wssu: WorkflowSubstateUserDto) => usersToFilterIds.indexOf(wssu.user.id) >= 0)
          ) {
            return true;
          }
          return false;
        })
        .map((ws: WorkflowStateDto) => {
          if (ws.anchor) {
            return ws;
          } else if (ws.front) {
            ws.workflowUsers = ws.workflowUsers.filter(
              (wssu: WorkflowSubstateUserDto) => usersToFilterIds.indexOf(wssu.user.id) >= 0
            );
            return ws;
          }
        });
    }

    return wStatesData;
  }
}
