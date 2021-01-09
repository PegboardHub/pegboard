export type Pos = {
    x: number,
    y: number,
};

export type Size = {
    width: number,
    height: number,
};
export type Dimensions = Pos & Size;

export type Input = Dimensions & {
    backgroundColor?: string
};


export type Constraints = Pos & {
    margin: number
}

