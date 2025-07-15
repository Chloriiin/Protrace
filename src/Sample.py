from Preprocessing import *
import pandas as pd
import numpy as np

class Sample:
    def __init__(self, dataframe, sample_name : str, background_well : str = None, sample_wells : list = None):
        self.dataframe = dataframe
        self.sample_name = sample_name
        self.background_well = background_well
        self.sample_wells = sample_wells
    def stdized_diff_sample_mean(self):
        """
        calculate the mean of difference between background well and sample wells (standardization by the background)
        """
        if (self.sample_wells is None):
            return self.dataframe[self.background_well]
        elif (self.background_well is None):
            return np.mean(self.dataframe[self.sample_wells], aixs = 1)
        else:
            return np.mean(self.dataframe[self.sample_wells].sub(self.dataframe[self.background_well], axis = 0), axis = 1)
    def stdized_diff_sample(self):
        if (self.sample_wells is None): 
            return self.dataframe[self.background_well]
        elif (self.background_well is None):
            return self.dataframe[self.sample_wells]
        else:
            return self.dataframe[self.sample_wells].sub(self.dataframe[self.background_well], axis = 0)
    pass

