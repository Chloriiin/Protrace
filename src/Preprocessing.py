import pandas as pd
import numpy as np

def pre_process_df(df : pd.DataFrame, reads_num : int) -> pd.DataFrame :
    if reads_num < 2:
        raise ValueError("reads_num must be greater or equal than 2!")
    if df is None or reads_num is None:
        raise ValueError("df or reads_num cannot be empty!")
    return df.loc[0: reads_num - 1]