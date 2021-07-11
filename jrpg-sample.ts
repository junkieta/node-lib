// from https://gamedevelopment.tutsplus.com/ja/articles/how-to-build-a-jrpg-a-primer-for-game-developers--gamedev-6676

interface IAction {
    TimeRemaining() : number;
    Update(elapsedTime: number) : void;
    IsReady() : boolean;
}

interface Entity {
    playerControlled: boolean
    Speed() : number
}

interface IState
{
    Update(elapsedTime: number);
    Render();
    OnEnter(param?: any);
    OnExit();
}

class PlayerDecide implements IAction {

    constructor(e: Entity, speed: number) {

    }
    TimeRemaining(): number {
        throw new Error("Method not implemented.");
    }
    Update(elapsedTime: number): void {
        throw new Error("Method not implemented.");
    }
    IsReady(): boolean {
        throw new Error("Method not implemented.");
    }

}

class AIDecide implements IAction {
    constructor(e: Entity, speed: number) {

    }
    TimeRemaining(): number {
        throw new Error("Method not implemented.");
    }
    Update(elapsedTime: number): void {
        throw new Error("Method not implemented.");
    }
    IsReady(): boolean {
        throw new Error("Method not implemented.");
    }
}

const EmptyState : IState =
{
    Update(elapsedTime: number)
    {
        // Nothing to update in the empty state.
    },
 
    Render()
    {
        // Nothing to render in the empty state
    },
 
    OnEnter()
    {
        // No action to take when the state is entered
    },
 
    OnExit()
    {
        // No action to take when the state is exited
    }
}

class BattleExecute implements IState {

    mStateMachine : StateMachine;
    mActions : IAction[];

     constructor(stateMachine: StateMachine, actions: IAction[])
    {
        this.mStateMachine = stateMachine;
        this.mActions = actions;
    }
    Update(elapsedTime: number) {
        throw new Error("Method not implemented.");
    }
    Render() {
        throw new Error("Method not implemented.");
    }
    OnEnter(param?: any) {
        throw new Error("Method not implemented.");
    }
    OnExit() {
        throw new Error("Method not implemented.");
    }
}


class StateMachine
{
    mStates = new Map<String, IState>();
    mCurrentState = EmptyState;
 
    Update(elapsedTime: number)
    {
        this.mCurrentState.Update(elapsedTime);
    }
 
    Render()
    {
        this.mCurrentState.Render();
    }
 
    Change(stateName: string, params? : any)
    {
        this.mCurrentState.OnExit();
        this.mCurrentState = this.mStates[stateName];
        this.mCurrentState.OnEnter(params);
    }
 
    Add(name: string, state: IState)
    {
        this.mStates[name] = state;
    }
}


class BattleState implements IState
{
    mActions: IAction[];
    mEntities: Entity[];
    mBattleStates: StateMachine;
 
    static SortByTime(a: IAction, b:IAction)
    {
        return a.TimeRemaining() > b.TimeRemaining() ? 1 : -1;
    }
 
    constructor(arg: any)
    {
        this.mActions = [];
        this.mEntities = [];
        this.mBattleStates = new StateMachine();
        this.mBattleStates.Add("tick", new BattleTick(this.mBattleStates, this.mActions));
        this.mBattleStates.Add("execute", new BattleExecute(this.mBattleStates, this.mActions));
    }
 
    OnEnter(params: any)
    {
        this.mBattleStates.Change("tick");
 
        //
        // Get a decision action for every entity in the action queue
        // The sort it so the quickest actions are the top
        //
 
        this.mEntities = params.entities;
        this.mActions.push(...this.mEntities.map((e) => 
            (e.playerControlled)
                ? new PlayerDecide(e, e.Speed())
                : new AIDecide(e, e.Speed())
        ));
        this.mActions.sort(BattleState.SortByTime);
    }
 
    Update(elapsedTime:number)
    {
        this.mBattleStates.Update(elapsedTime);
    }
 
    Render()
    {
        // Draw the scene, gui, characters, animations etc
 
        this.mBattleStates.Render();
    }
 
    OnExit()
    {
 
    }
}

class BattleTick implements IState
{
    mStateMachine : StateMachine;
    mActions : IAction[];
 
    constructor(stateMachine: StateMachine, actions: IAction[])
    {
        this.mStateMachine = stateMachine;
        this.mActions = actions;
    }
 
    // Things may happen in these functions but nothing we're interested in.
    OnEnter() {}
    OnExit() {}
    Render() {}
    Update(elapsedTime: number)
    {
        this.mActions.forEach((a) => a.Update(elapsedTime));
        if(this.mActions[this.mActions.length-1].IsReady())
            this.mStateMachine.Change("execute", this.mActions.pop());
    }
}




const gGameMode = new StateMachine();
 
// A state for each game mode
//gGameMode.Add("mainmenu",   new MainMenuState(gGameMode));
//gGameMode.Add("localmap",   new LocalMapState(gGameMode));
//gGameMode.Add("worldmap",   new WorldMapState(gGameMode));
gGameMode.Add("battle",     new BattleState(gGameMode));
//gGameMode.Add("ingamemenu", new InGameMenuState(gGameMode));
 
gGameMode.Change("battle");
 
// Main Game Update Loop
requestAnimationFrame(function main() {
    const elapsedTime = performance.now();
    gGameMode.Update(elapsedTime);
    gGameMode.Render();
});
