import uniqid from 'uniqid';

export class MockSocket {
  public id = uniqid();
  public eventStack = new Map<string, (arg: any) => void>();

  public join = jest.fn((room: string) => this);
  public leave = jest.fn((room: string) => this);
  public emit = jest.fn((event: string, data: any) => this);
  public on = jest.fn((event: string, callback: (args: any) => void) => {
    this.eventStack.set(event, callback);
  });
  __emitToSelf = (event: string, data: any) => {
    const callback = this.eventStack.get(event);

    callback && callback(data);
  };
}
